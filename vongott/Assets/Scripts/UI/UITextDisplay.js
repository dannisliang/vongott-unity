#pragma strict

class UITextDisplay extends OGPage {
	var displayTextLabel : OGLabel;
	public static var displayText : String = "";
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		displayTextLabel.text = displayText;
	}
		
	override function ExitPage () {
	}	
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.Return) ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
		}
	}
}