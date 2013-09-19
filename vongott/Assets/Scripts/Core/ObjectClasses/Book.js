#pragma strict

class Book extends InteractiveObject {
	var content : String;
	
	// Handle read
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Read [F]" );
	}
	
	override function Interact () {
		if ( Input.GetKeyDown(KeyCode.F) ) {
			UITextDisplay.displayText = content;
			UIHUD.ShowNotification ( "" );
			OGRoot.GoToPage ( "TextDisplay" );
		}
	}
}