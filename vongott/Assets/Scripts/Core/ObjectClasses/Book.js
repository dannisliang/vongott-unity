#pragma strict

class Book extends InteractiveObject {
	var content : String;
	
	// Handle read
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Read [LeftMouse]" );
	}
	
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive ) {
			UITextDisplay.displayText = content;
			UIHUD.ShowNotification ( "" );
			OGRoot.GoToPage ( "TextDisplay" );
		}
	}
	
	function Start () {
		if ( EditorCore.running ) {
			this.GetComponent ( SphereCollider ).enabled = false;
			Destroy ( this.rigidbody );			
		}
	}
}