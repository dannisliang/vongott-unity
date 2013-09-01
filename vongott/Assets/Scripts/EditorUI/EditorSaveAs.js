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
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}

	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGRoot.GoToPage ( "MenuBase" );
		}
	}
}