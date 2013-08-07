#pragma strict

class UIModWheel extends OGPage {
	override function StartPage () {
		GameCore.GetInstance().SetPause ( true );
	}
	
	function Pick ( slot : String ) {
		var s : UpgradeManager.eSlotID = System.Enum.Parse ( typeof ( UpgradeManager.eSlotID ), slot );
		
		OGRoot.GoToPage ( "HUD" );
		UpgradeManager.Activate ( s );
	}
	
	override function UpdatePage () {
		if ( Input.GetMouseButtonDown(2) || Input.GetKeyDown( KeyCode.Escape ) ) {
			OGRoot.GoToPage ( "HUD" );
		}
	}
}