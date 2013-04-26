#pragma strict

class EditorRenameLevel extends OGPage {	
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
		EditorCore.SaveFile ( EditorCore.currentLevel.name );
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}

	////////////////////
	// Update
	////////////////////
	function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGRoot.GoToPage ( "MenuBase" );
		}
	}
}