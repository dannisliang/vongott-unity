#pragma strict

class EditorPlayMode extends OGPage {	
	////////////////////
	// Update
	////////////////////
	function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			EditorCore.ExitLevel ();
			OGRoot.GoToPage ( "MenuBase" );
		}
	}
}