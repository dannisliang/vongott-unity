﻿#pragma strict

class MainMenuBase extends OGPage {
	public function GoToPage ( pageName : String ) {
		OGRoot.GetInstance().GoToPage ( pageName );
	}
	
	public function ExitGame () {
	
	}
}