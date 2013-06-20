#pragma strict

import System.IO;

class EditorBrowser extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Classes
	private class Folder {
		var name : String;
		var subFolders : List.< Folder > = new List.< Folder >();
		var files : Object[];
		var path : String;
	
		function Folder ( n : String ) {
			name = n;
			path = name;
		} 
	
		function AddFolder ( f : Folder ) {
			f.path = path + "/" + f.name;
			f.files = Resources.LoadAll ( f.path );
			
			subFolders.Add ( f );
		}
	
		function FindFolder ( n : String ) : Folder {
			for ( var f : Folder in subFolders ) {
				if ( n == f.name ) {
					return f;
				}
			}
			
			return null;
		}
		
		function FindFile ( n : String ) : GameObject {
			for ( var f : Object in files ) {
				var obj : GameObject = f as GameObject;
				
				if ( n == obj.name ) {
					return obj;
				}
			}
			
			return null;
		}
	}

	// Public vars
	var fileList : Transform;
	var addButton : OGButton;
	var title : OGLabel;
	var fileAttr : OGLabel;
	var fileInfo : OGLabel;
	var breadCrumbs : Transform;
	
	// Static vars
	static var rootFolder : String = "Actors";
	static var initMode : String = "Add";
	static var argument : String;
	static var button : OGButton;
	
	// Hidden vars
	@HideInInspector var currentFolder : Folder;
	@HideInInspector var selectedFolder : Folder;
	@HideInInspector var resourcesFolder : Folder = new Folder( "Resources" );
	@HideInInspector var selectedFile : GameObject;
	@HideInInspector var mode : String;
	@HideInInspector var breadPos : float = 0;
	
	@HideInInspector var navCursor : int = 0;
	@HideInInspector var navList : List.< OGButton > = new List.< OGButton >();
	
	////////////////////
	// Init
	////////////////////
	// Folders
	private function InitFolders () {
		// Actors
		var actorsFolder : Folder = new Folder ( "Actors" );
		actorsFolder.AddFolder ( new Folder ( "Animals" ) );
		actorsFolder.AddFolder ( new Folder ( "NPC" ) );
		actorsFolder.AddFolder ( new Folder ( "Player" ) );
	
		// Items
		var itemsFolder : Folder = new Folder ( "Items" );
		itemsFolder.AddFolder ( new Folder ( "Consumables" ) );
		itemsFolder.AddFolder ( new Folder ( "Equipment" ) );
		itemsFolder.AddFolder ( new Folder ( "Upgrades" ) );
		
		// Prefabs
		var prefabsFolder : Folder = new Folder ( "Prefabs" );
		
		// ^ levels
		var prefabsLevelsFolder = new Folder ( "Levels" );
		prefabsLevelsFolder.AddFolder ( new Folder ( "AwesomeIsland" ) );
		prefabsFolder.AddFolder ( prefabsLevelsFolder );
		
		// ^ interior
		var prefabsInteriorFolder = new Folder ( "Interior" );
		prefabsInteriorFolder.AddFolder ( new Folder ( "Furniture" ) );
		prefabsFolder.AddFolder ( prefabsInteriorFolder );
		
		prefabsFolder.AddFolder ( new Folder ( "Airducts" ) );
		prefabsFolder.AddFolder ( new Folder ( "Doors" ) );
		prefabsFolder.AddFolder ( new Folder ( "Walls" ) );
		prefabsFolder.AddFolder ( new Folder ( "Windows" ) );
		
		// Add to master list
		resourcesFolder.AddFolder ( actorsFolder );
		resourcesFolder.AddFolder ( itemsFolder );
		resourcesFolder.AddFolder ( prefabsFolder );
	}
	
	// Page	
	override function StartPage () {
		SetMode ( initMode );
		
		InitFolders ();
		ClearList ();
		currentFolder = resourcesFolder;
		
		PopulateList ( resourcesFolder.FindFolder ( rootFolder ) );
	}
	
	////////////////////
	// Update
	////////////////////
	// Page
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.DownArrow ) ) {
			if ( !selectedFile && !selectedFolder ) {
				navCursor = 0;
			} else if ( navCursor < navList.Count - 1 ) {
				navCursor++;
			}
		
			this.gameObject.SendMessage ( navList [ navCursor ].message, navList [ navCursor ] );
		
		} else if ( Input.GetKeyDown ( KeyCode.UpArrow ) ) {
			if ( !selectedFile && !selectedFolder ) {
				navCursor = navList.Count - 1;
			} else if ( navCursor > 0 ) {
				navCursor--;
			}
		
			this.gameObject.SendMessage ( navList [ navCursor ].message, navList [ navCursor ] );
		
		} else if ( Input.GetKeyDown ( KeyCode.Return ) ) {
			Add ();
			
		}
	}
	
	////////////////////
	// Navigation
	////////////////////
	// Clear all
	private function ClearList () {
		EditorCore.ClearPreview ();
		navList.Clear ();
						
		fileAttr.text = "";
		fileInfo.text = "";
		
		for ( var i = 0; i < fileList.childCount; i++ ) {
			Destroy ( fileList.GetChild ( i ).gameObject );
		}
	}
	
	// Deselect all
	function DeselectAll () {
		for ( var i = 0; i < fileList.transform.childCount; i++ ) {
			var btn : OGButton = fileList.transform.GetChild ( i ).gameObject.GetComponent ( OGButton );
			btn.style = "listitem";		
		}
	}
	
	// Create list item
	private function CreateButton ( objName : String, index : int, type : String ) {
		var obj : GameObject = new GameObject ( objName );
		var btn = obj.AddComponent ( OGButton );
	
		btn.text = objName;
		btn.target = this.gameObject;
		btn.message = "Select" + type;
		btn.style = "listitem";
		
		obj.transform.parent = fileList;
		obj.transform.localScale = new Vector3 ( 468, 30, 1 );
		obj.transform.localPosition = new Vector3 ( 0, index * 32, -2 );
		
		navList.Add ( btn );
	}
	
	// Create breadcrumbs
	private function CreateBreadCrumbs () {
		var i : int = 0;
		var strings : String[] = currentFolder.path.Split ( "/"[0] );
	
		breadPos = 0;
	
		for ( i = 0; i < breadCrumbs.childCount; i++ ) {
			Destroy ( breadCrumbs.GetChild ( i ).gameObject );
		}
	
		for ( i = 0; i < strings.Length; i++ ) {
			if ( strings[i] == "Resources" ) { continue; }
			
			var obj : GameObject = new GameObject ( strings[i] );
			var btn : OGButton = obj.AddComponent ( OGButton );
			
			if ( i == strings.Length - 1 ) {
				btn.style = "listitem";
			}	
			
			btn.target = this.gameObject;
			btn.message = "GoToDir";
			btn.argument = strings[i];
			
			obj.transform.parent = breadCrumbs;
			obj.transform.localPosition = new Vector3 ( breadPos, 0, 0 );
							
			if ( strings[i] == rootFolder ) {
				btn.text = "/";
				obj.transform.localScale = new Vector3 ( 20, 20, 1 );
				breadPos += 30;
			} else {
				btn.text = strings[i];
				obj.transform.localScale = new Vector3 ( 100, 20, 1 );
				breadPos += 110;
			}
		}
	}
	
	// Populate file list	
	private function PopulateList ( folder : Folder ) {
		if ( !folder ) { return; }
		
		currentFolder = folder;
		ClearList ();
		
		var i : int = 0;
				
		// List files
		if ( currentFolder.files && currentFolder.files.Length > 0 ) {
			for ( var f : Object in currentFolder.files ) {
				var obj : GameObject = f as GameObject;
				
				CreateButton ( obj.name, i, "File" );
				
				i++;
			}
		
		// List folders	
		} else {
			for ( var f : Folder in currentFolder.subFolders ) {
				CreateButton ( f.name, i, "Folder" );
				
				i++;
			}
		}
		
		// Create breadcrumbs
		CreateBreadCrumbs ();
	}
	
	// Select file 
	function SelectFile ( btn : OGButton ) {
		DeselectAll ();
		
		selectedFile = currentFolder.FindFile ( btn.text );
		btn.style = "listitemselected";
		
		var attributes : ObjectAttributes = EditorCore.PreviewObject ( selectedFile );
		
		fileAttr.text = attributes.keys;
		fileInfo.text = attributes.values;

		SetMode ( initMode );
	}
	
	// Select folder
	function SelectFolder ( btn : OGButton ) {
		DeselectAll ();
		
		selectedFolder = currentFolder.FindFolder ( btn.text );
		btn.style = "listitemselected";
		
		SetMode ( "Open" );
	}
	
	// Go to directory
	function GoToDir ( dir : String ) {
		PopulateList ( resourcesFolder.FindFolder ( dir ) );
	}
	
	// Close window
	function OK () {
		EditorCore.ClearPreview ();
		
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	// Set mode
	function SetMode ( m : String ) {
		mode = m;
		addButton.text = m;
		title.text = "Select " + rootFolder.ToLower();
	}
	
	// Action button
	function Add () {
		EditorCore.ClearPreview ();
		
		if ( mode == "Add" ) {
			EditorCore.AddObject ( selectedFile );
			OGRoot.GoToPage ( "MenuBase" );
		
		} else if ( mode == "Equip" ) {
			EditorCore.EquipItem ( selectedFile, int.Parse(argument) );
			EditorCore.ReselectObject();
			OGRoot.GoToPage ( "MenuBase" );
			
		} else if ( mode == "Open" ) {
			PopulateList ( selectedFolder );
			
		}
		
		
	}
}