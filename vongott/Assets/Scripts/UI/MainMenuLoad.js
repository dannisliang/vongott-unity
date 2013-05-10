#pragma strict

class MainMenuLoad extends OGPage {
	var mainMenu : MainMenu;
	
	function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			mainMenu.Transition ( "" );
		}
	}
}