#pragma strict

class MainMenuCommunity extends OGPage {
	var mainMenu : MainMenu;
		
	function StartEditor () {
		Application.LoadLevel ( "editor" );
	}
	
	function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			mainMenu.Transition ( "" );
		}
	}
}