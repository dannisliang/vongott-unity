#pragma strict

class EditorCharacters extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var background : OGRect;
	var title : OGLabel;
	var objList : OGScrollView;
	var addButton : OGButton;

	// Private vars
	private var pickedObject : Prefab;
	
	
	////////////////////
	// Prefab functions
	////////////////////
	// Add prefab
	var addObj : Function = function () {
		//pickedObject.Spawn();
	};
	
		
	////////////////////
	// Init
	////////////////////
	override function Init () {		
		// background
		background = new OGRect ();
		background.x = ( Screen.width / 2 ) - ( Screen.width * 0.4 );
		background.y = ( Screen.height / 2 ) - ( Screen.height * 0.4 );
		background.width = Screen.width * 0.8;
		background.height = Screen.height * 0.8;
		
		// title
		title = new OGLabel ( "Add a prefab" );
		title.x = background.x + 16;
		title.y = background.y + 16;
		title.style.fontStyle = FontStyle.Bold;
		title.style.fontSize = 12;
		
		// add button
		addButton = new OGButton ( "OBJ", addObj );
		addButton.width = 64;
		addButton.height = 16;
		addButton.x = background.x + 16;
		addButton.y = background.y + 48;
		
		// obj list
		objList = new OGScrollView ();
			
		objList.x = background.x;
		objList.y = background.y + 128;
		objList.width = background.width;
		objList.height = background.height - 128;
	
		// add widgets
		OGCore.Add ( background );
		OGCore.Add ( objList );
		OGCore.Add ( title );
		OGCore.Add ( addButton );
	}
	
	////////////////////
	// Update
	////////////////////
	override function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGPageManager.GoToPage ( "BaseMenu" );
		}
	}
}