#pragma strict

class EditorSaveAs extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var newName : OGTextField;


	////////////////////
	// Pick a name
	////////////////////
	// OK
	function OK () {
		EditorCore.currentLevel.name = newName.text;
		EditorCore.GetInstance().SaveFile ( EditorCore.currentLevel.name );
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}

	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGRoot.GetInstance().GoToPage ( "MenuBase" );
		}
	}
}