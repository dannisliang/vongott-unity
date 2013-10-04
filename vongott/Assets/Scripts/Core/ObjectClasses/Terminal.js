#pragma strict

class Terminal extends InteractiveObject {
	var cameras : SurveillanceCamera[] = new SurveillanceCamera[3];
	
	// Handle read
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Interact [LeftMouse]" );
	}
	
	function GetCameraOutputs () {
	
	}
	
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive ) {
			UIHUD.ShowNotification ( "" );
			OGRoot.GoToPage ( "TextDisplay" );
		}
	}
	
	function Start () {
		if ( EditorCore.running ) {
			this.GetComponent ( SphereCollider ).enabled = false;		
		}
	}
}