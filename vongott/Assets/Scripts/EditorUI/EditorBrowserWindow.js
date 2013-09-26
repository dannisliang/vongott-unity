#pragma strict

import System.IO;

class EditorBrowserWindow extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var fileList : Transform;
	var addButton : OGButton;
	var title : OGLabel;
	var fileAttr : OGLabel;
	var fileInfo : OGLabel;
	var breadCrumbs : Transform;
	var preview2D : OGImage;
			
	// Static vars
	static var rootFolder : String = "Actors";
	static var initMode : String = "Add";
	static var argument : String;
	static var button : OGButton;
	static var callback : Function;
	
	// Hidden vars
	@HideInInspector var currentFolder : EditorFileSystem.Folder;
	@HideInInspector var selectedFolder : EditorFileSystem.Folder;
	@HideInInspector var resourcesFolder : EditorFileSystem.Folder;
	@HideInInspector var selectedFile : Object;
	@HideInInspector var mode : String;
	@HideInInspector var breadPos : float = 0;
	
	@HideInInspector var navCursor : int = 0;
	@HideInInspector var navList : List.< OGButton > = new List.< OGButton >();
	
	////////////////////
	// Init
	////////////////////
	// Page	
	override function StartPage () {
		preview2D.image = null;
		
		SetMode ( initMode );
		
		ClearList ();
		resourcesFolder = EditorFileSystem.GetResources();
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
	private function PopulateList ( folder : EditorFileSystem.Folder ) {
		if ( !folder ) { return; }
		
		preview2D.image = null;
		
		currentFolder = folder;
		ClearList ();
		
		var i : int = 0;
				
		// List files
		if ( currentFolder.files && currentFolder.files.Length > 0 ) {
			for ( var f : Object in currentFolder.files ) {
				if ( f.GetType() == GameObject ) {
					var obj : GameObject = f as GameObject;
					CreateButton ( obj.name, i, "File" );
									
				} else if ( f.GetType() == Material ) {
					var mat : Material = f as Material;
					CreateButton ( mat.name, i, "File" );
									
				} 
				
				i++;
			}
		
		// List folders	
		} else {
			for ( var f : EditorFileSystem.Folder in currentFolder.subFolders ) {
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
	
		if ( selectedFile.GetType() == GameObject ) {	
			var obj : GameObject = selectedFile as GameObject;
			var attributes : ObjectAttributes = EditorCore.PreviewObject ( obj );
			fileAttr.text = attributes.keys;
			fileInfo.text = attributes.values;
		
			StartCoroutine ( EditorCore.GetObjectIcon ( obj, preview2D ) );
		
		} else if ( selectedFile.GetType() == Material ) {
			var mat : Material = selectedFile as Material;
			
			if ( mat.mainTexture ) {
				preview2D.image = mat.mainTexture as Texture2D;
			}
			
			fileAttr.text = mat.name;
		
		}

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
			EditorCore.AddObject ( selectedFile as GameObject );
			OGRoot.GoToPage ( "MenuBase" );
		
		} else if ( mode == "Equip" ) {
			EditorCore.EquipItem ( (selectedFile as GameObject), int.Parse(argument) );
			EditorCore.ReselectObject();
			OGRoot.GoToPage ( "MenuBase" );
			
		} else if ( mode == "Open" ) {
			PopulateList ( selectedFolder );
			
		} else if ( mode == "Use" ) {
			if ( rootFolder == "Materials" || rootFolder == "Foliage" ) {
				callback ( selectedFolder.path + "/" + (selectedFile as Material ).name );
			}
			
			EditorCore.ReselectObject();
			OGRoot.GoToPage ( "MenuBase" );
		}
		
	}
}