#pragma strict

class MainMenuNew extends OGPage {
	var mainMenu : MainMenu;
		
	function NewGame () {
		Application.LoadLevel ( "game" );
	}
	
	function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			mainMenu.Transition ( "" );
		}
	}
}