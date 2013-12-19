#pragma strict

class EditorBrowserPanel extends MonoBehaviour {
	// Serialized vars
	public var fileList : Transform;
	public var popupMenu : OGPopUp;
	public var title : OGLabel;	
	public var inspectorName : OGLabel;
	public var replaceButton : GameObject;
					
	// Private vars
	private var resourcesFolder : EditorFileSystem.Folder;
	private var selectedFile : Object;
	private var currentTab : String = "";
	private var currentFolder : EditorFileSystem.Folder;
	private var currentActorsCategory : String = "";
	private var currentItemsCategory : String = "";
	private var currentPrefabsCategory : String = "";
	
	// Start
	function Start () {
		transform.localPosition = new Vector3 ( -200, 0, 5 );
	
	}
	
	// Init
	public function Init ( tab : String, category : String ) {
		Debug.Log ( "EditorBrowserPanel | Finding " + tab + " > " + category );
		
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
	public function SelectFile ( btn : OGListItem ) {
		selectedFile = currentFolder.FindFile ( btn.text );
								
		inspectorName.text = btn.text;
		
		for ( var i : int = 0; i < fileList.transform.childCount; i++ ) {
			var b : OGListItem = fileList.transform.GetChild(i).GetComponent(OGListItem);
			if ( b ) {
				b.isTicked = b == btn;
			}
		}
	}

	// Create list item
	private function CreateButton ( objName : String, index : int, type : String ) {
		var obj : GameObject = new GameObject ( objName );
		var btn = obj.AddComponent ( OGListItem );
		
		btn.text = objName;	
		btn.target = this.gameObject;
		btn.message = "Select" + type;

		//StartCoroutine ( EditorCore.GetObjectIcon ( currentFolder.FindFile ( btn.gameObject.name ) as GameObject, img ) );
		
		obj.transform.parent = fileList;
		obj.transform.localScale = new Vector3 ( 180, 30, 1 );
		obj.transform.localPosition = new Vector3 ( 0, index * 30, 0 );
	
		btn.GetDefaultStyles();
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
