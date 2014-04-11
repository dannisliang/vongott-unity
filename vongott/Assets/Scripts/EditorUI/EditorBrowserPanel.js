#pragma strict

class EditorBrowserPanel extends MonoBehaviour {
	public var fileList : Transform;
	public var popupMenu : OGPopUp;
	public var title : OGLabel;	
	public var inspectorName : OGLabel;
	public var replaceButton : GameObject;
					
	private var resourcesFolder : EditorFileSystem.Folder;
	private var selectedFile : Object;
	private var currentTab : String = "";
	private var currentFolder : EditorFileSystem.Folder;
	private var currentActorsCategory : String = "";
	private var currentItemsCategory : String = "";
	private var currentPrefabsCategory : String = "";
	private var col : int = 0;
	private var row : int = 0;

	// Start
	function Start () {
		transform.localPosition = new Vector3 ( -200, 0, 5 );
	
	}
	
	// Init
	public function Init ( tab : String, category : String ) {
		resourcesFolder = EditorFileSystem.GetResources();
			
		currentTab = tab;
		title.text = currentTab;
		
		popupMenu.options = resourcesFolder.FindFolder(tab).GetFolderNames();
		
		popupMenu.selectedOption = category;
					
		PopulateList ( resourcesFolder.FindFolder(tab).FindFolder(category) );
	
		OGRoot.GetInstance().SetDirty();
	}

	// Pick category
	public function PickCategory ( category : String ) {
		Init ( currentTab, category );
	}

	// Toggle panel
	private function TogglePanel () {
		if ( transform.localPosition.x == 10 ) {
			transform.localPosition = new Vector3 ( -200, 0, 5 );
			
		} else {
			transform.localPosition = new Vector3 ( 10, 0, 5 );
		
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
		}
		
		Init ( tab, category );
	}

	// Place object
	public function PlaceObject () {
		if ( selectedFile.GetType() == GameObject ) {
			EditorCore.AddObject ( selectedFile as GameObject );
		}
	}

	// Replace object
	public function ReplaceObject () {
		if ( selectedFile.GetType() == GameObject ) {
			EditorCore.ReplaceSelectedObject ( selectedFile as GameObject );
		}
	}

	// Select file
	public function SelectFile ( name : String ) {
		selectedFile = currentFolder.FindFile ( name );
								
		inspectorName.text = name;
	}

	public function SelectFile ( id : String, name : String ) {
		selectedFile = currentFolder.FindFile ( id );
		
		inspectorName.text = name;						
	}

	// Create list item
	private function CreateButton ( objName : String, index : int, type : String ) {
		var obj : GameObject = new GameObject ( objName );
		var btn : OGListItem = obj.AddComponent ( OGListItem );
		var img : OGTexture = new GameObject ( "tex", OGTexture ).GetComponent ( OGTexture );
		var pos : Vector2 = new Vector2 ();
		var size : float = 90;
		var go : GameObject = currentFolder.FindFile ( obj.gameObject.name ) as GameObject;

		pos.x = col * size;
		pos.y = row * size;
		
		if ( col > 0 ) {
			col = 0;
			row++;
		} else {
			col++;
		}

		btn.text = "";	
		btn.hoverFunc = function () {
			if ( go.GetComponent(Prefab) && !String.IsNullOrEmpty ( go.GetComponent(Prefab).title ) ) {
				SelectFile ( objName, go.GetComponent(Prefab).title );
			} else if ( go.GetComponent(Actor) && !String.IsNullOrEmpty ( go.GetComponent(Actor).displayName ) ) {
				SelectFile ( objName, go.GetComponent(Actor).displayName );
			} else {
				SelectFile ( objName );
			}
		};
		
		StartCoroutine ( EditorCore.GetObjectIcon ( go, img ) );
		
		obj.transform.parent = fileList;
		obj.transform.localPosition = pos;
		btn.transform.localScale = new Vector3 ( size, size, 1 );

		img.transform.parent = obj.transform;
		img.transform.localPosition = new Vector3 ( 0, 0, -1 );
		img.transform.localScale = Vector3.one;

		btn.ApplyDefaultStyles();
	}

	function Update () {
		replaceButton.SetActive ( EditorCore.GetSelectedObject() != null );
	}

	// Clear all
	private function ClearList () {
		for ( var i = 0; i < fileList.childCount; i++ ) {
			Destroy ( fileList.GetChild ( i ).gameObject );
		}
	}

	// Populate list
	private function PopulateList ( folder : EditorFileSystem.Folder ) {
		col = 0;
		row = 0;
		
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
