#pragma strict

class EditorBrowserPanel extends MonoBehaviour {
	// Serialized vars
	public var fileList : Transform;
	public var popupMenu : OGPopUp;
	public var title : OGLabel;	
	public var inspectorName : OGLabel;
	public var replaceButton : GameObject;
	public var shapeButtons : GameObject;
					
	// Private vars
	private var resourcesFolder : EditorFileSystem.Folder;
	private var selectedFile : Object;
	private var selectedShape : String;
	private var currentTab : String = "";
	private var currentFolder : EditorFileSystem.Folder;
	private var currentActorsCategory : String = "";
	private var currentItemsCategory : String = "";
	private var currentPrefabsCategory : String = "";
	
	// Start
	function Start () {
		transform.localPosition = new Vector3 ( -200, 0, 0 );
	
	}
	
	// Init
	public function Init ( tab : String, category : String ) {
		if ( tab == "Shapes" ) {
			shapeButtons.SetActive ( true );
			//fileList.gameObject.SetActive ( false );
		
			currentTab = tab;
			title.text = currentTab;
		
		} else {
			Debug.Log ( "EditorBrowserPanel | Finding " + tab + " > " + category );
			
			shapeButtons.SetActive ( false );
			//fileList.gameObject.SetActive ( true );
			
			resourcesFolder = EditorFileSystem.GetResources();
			
			currentTab = tab;
			title.text = currentTab;
			
			popupMenu.options = resourcesFolder.FindFolder(tab).GetFolderNames();
			
			popupMenu.selectedOption = category;
						
			PopulateList ( resourcesFolder.FindFolder(tab).FindFolder(category) );
		}
	}

	// Pick category
	public function PickCategory ( category : String ) {
		Init ( currentTab, category );
	}

	// Toggle panel
	private function TogglePanel () {
		if ( transform.localPosition.x == 0 ) {
			transform.localPosition = new Vector3 ( -200, 0, 0 );
			
		} else {
			transform.localPosition = new Vector3 ( 0, 0, 0 );
		
		}
	}

	// Open tab
	public function OpenTab ( tab : String ) {
		// Detect open of close drawer
		if ( currentTab == tab || currentTab == "" ) {
			TogglePanel ();
		}
		
		var category : String;
		
		switch ( tab ) {
			case "Actors":
				popupMenu.gameObject.SetActive ( true );
				if ( currentActorsCategory == "" ) {
					currentActorsCategory = "NPC";
				}
				category = currentActorsCategory;
				break;
		
			case "Items":
				popupMenu.gameObject.SetActive ( true );
				if ( currentItemsCategory == "" ) {
					currentItemsCategory = "Equipment";
				}
				category = currentItemsCategory;
				break;
		
			case "Prefabs":
				popupMenu.gameObject.SetActive ( true );
				if ( currentPrefabsCategory == "" ) {
					currentPrefabsCategory = "Doors";
				}
				category = currentPrefabsCategory;
				break;
				
			default:
				popupMenu.gameObject.SetActive ( false );
				category = "Shapes";
				break;
		}
		
		Init ( tab, category );
	}

	// Place object
	public function PlaceObject () {
		if ( currentTab == "Shapes" ) {
			EditorCore.AddObject ( Resources.Load ( "Shapes/" + selectedShape ) as GameObject );
		
		} else {
			if ( selectedFile.GetType() == GameObject ) {
				EditorCore.AddObject ( selectedFile as GameObject );
			}
	
		}
	}

	// Replace object
	public function ReplaceObject () {
		if ( currentTab == "Shapes" ) {
			EditorCore.ReplaceSelectedObject ( Resources.Load ( "Shapes/" + selectedShape ) as GameObject );
		
		} else {
			if ( selectedFile.GetType() == GameObject ) {
				EditorCore.ReplaceSelectedObject ( selectedFile as GameObject );
			}
		}
	}

	// Deselect all
	function DeselectAll () {
		var i : int = 0;
		var c : Component;
		var btn : OGButton;
				
		if ( shapeButtons.activeSelf ) {
			for ( c in shapeButtons.GetComponentsInChildren(OGButton) ) {
				btn = c as OGButton;
				btn.style = "listitem";
			}
		
		} else {
			for ( c in fileList.GetComponentsInChildren(OGButton) ) {
				btn = c as OGButton;
				btn.style = "listitem";
			}
		
		}
	}
		
	// Select shape
	public function SelectShape ( btn : OGButton ) {
		DeselectAll ();
		
		btn.style = "listitemselected";
		
		inspectorName.text = btn.text;
		selectedShape = "shape_" + btn.gameObject.name;
	}
	
	// Select file
	public function SelectFile ( btn : OGButton ) {
		DeselectAll ();
		
		btn.style = "listitemselected";
		
		selectedFile = currentFolder.FindFile ( btn.gameObject.name );
								
		inspectorName.text = btn.gameObject.name;
	}

	// Create list item
	private function CreateButton ( objName : String, index : int, type : String ) {
		var obj : GameObject = new GameObject ( objName );
		var img = obj.AddComponent ( OGImage );
		var btn = obj.AddComponent ( OGButton );
		
		var xPos : float = 0;
		var yPos : float = index * 45;
	
		if ( index % 2 != 0 ) {
			xPos = 90;
			yPos = (index-1) * 45;
		}
	
		btn.target = this.gameObject;
		btn.message = "Select" + type;
		btn.style = "listitem";
		
		StartCoroutine ( EditorCore.GetObjectIcon ( currentFolder.FindFile ( btn.gameObject.name ) as GameObject, img ) );
		
		obj.transform.parent = fileList;
		obj.transform.localScale = new Vector3 ( 80, 80, 1 );
		obj.transform.localPosition = new Vector3 ( xPos, yPos, -2 );
	}

	function Update () {
		replaceButton.SetActive ( EditorCore.GetSelectedObject() != null );
	}

	// Clear all
	private function ClearList () {
		for ( var i = 0; i < fileList.childCount; i++ ) {
			if ( fileList.GetChild ( i ).gameObject != shapeButtons ) {
				Destroy ( fileList.GetChild ( i ).gameObject );
			}
		}
	}

	// Populate list
	private function PopulateList ( folder : EditorFileSystem.Folder ) {
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
	}
}