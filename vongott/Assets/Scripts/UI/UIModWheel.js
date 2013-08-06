#pragma strict

class UIModWheel extends OGPage {
	override function StartPage () {
		GameCore.GetInstance().SetPause ( true );
	}
	
	function Pick ( mod : String ) {
		OGRoot.GoToPage ( "HUD" );
		UpgradeManager.Activate ( mod );
	}
	
	override function UpdatePage () {
		if ( Input.GetMouseButtonDown(2) || Input.GetKeyDown( KeyCode.Escape ) ) {
			OGRoot.GoToPage ( "HUD" );
		}
	}
}