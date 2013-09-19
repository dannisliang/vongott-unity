#pragma strict

class UITextDisplay extends OGPage {
	var displayTextLabel : OGLabel;
	public static var displayText : String = "";
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		GameCore.GetInstance().SetPause ( true );
		displayTextLabel.text = displayText;
	}
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.Return) ) {
			OGRoot.GoToPage ( "HUD" );
			GameCore.GetInstance().SetPause ( false );
		}
	}
}