#pragma strict

class MainMenuNew extends OGPage {
	var mainMenu : MainMenu;
	
	function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			mainMenu.Transition ( "" );
		}
	}
}