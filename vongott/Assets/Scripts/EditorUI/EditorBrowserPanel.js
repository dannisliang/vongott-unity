#pragma strict

class EditorBrowserPanel extends MonoBehaviour {
	// Serialized vars
	public var fileList : Transform;
	public var popupMenu : OGPopUp;
	public var title : OGLabel;	
	public var inspectorName : OGLabel;
			
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
		transform.localPosition = new Vector3 ( -200, 0, 0 );
	
	}
	
	// Init
	public function Init ( tab : String, category : String ) {
		resourcesFolder = EditorFileSystem.GetResources();
		
		currentTab = tab;
		title.text = currentTab;
		
		popupMenu.options = resourcesFolder.FindFolder(tab).GetFolderNames();
		
		popupMenu.selectedOption = category;
		
		Debug.Log ( "EditorBrowserPanel | Finding " + tab + " > " + category );
		
		PopulateList ( resourcesFolder.FindFolder(tab).FindFolder(category) );
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
		
		if ( tab == "Actors" ) {
			if ( currentActorsCategory == "" ) {
				currentActorsCategory = "NPC";
			}
			
			category = currentActorsCategory;
		
		} else if ( tab == "Items" ) {
			if ( currentItemsCategory == "" ) {
				currentItemsCategory = "Equipment";
			}
			
			category = currentItemsCategory;
		
		} else if ( tab == "Prefabs" ) {
			if ( currentPrefabsCategory == "" ) {
				currentPrefabsCategory = "Walls";
			}
			
			category = currentPrefabsCategory;
		
		}
		
		Init ( tab, category );
	}

	// Place object
	public function PlaceObject () {
		if ( selectedFile.GetType() == GameObject ) {
			EditorCore.AddObject ( selectedFile as GameObject );
		}
	}

	// Deselect all
	function DeselectAll () {
		for ( var i = 0; i < fileList.transform.childCount; i++ ) {
			var btn : OGButton = fileList.transform.GetChild ( i ).gameObject.GetComponent ( OGButton );
			btn.style = "listitem";		
		}
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
		var btn = obj.AddComponent ( OGButton );
		var img = obj.AddComponent ( OGImage );
		
		var xPos : float = 0;
		var yPos : float = index * 45;
	
		if ( index % 2 != 0 ) {
			xPos = 90;
			yPos = (index-1) * 45;
		}
	
		btn.target = this.gameObject;
		btn.message = "Select" + type;
		btn.style = "listitem";
		
		img.image = EditorCore.GetObjectIcon ( currentFolder.FindFile ( btn.gameObject.name ) as GameObject );
		
		obj.transform.parent = fileList;
		obj.transform.localScale = new Vector3 ( 80, 80, 1 );
		obj.transform.localPosition = new Vector3 ( xPos, yPos, -2 );
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