﻿#pragma strict

class MainMenuNew extends OGPage {
	public function StartGame () {
	
	}

	public function GoBack () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
}