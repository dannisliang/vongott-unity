#pragma strict

class LiftableItem extends InteractiveObject {
	private var isPickedUp : boolean = false;
	
	// Prompt
	override function InvokePrompt () {
		if ( isPickedUp ) {
			UIHUD.ShowNotification ( "Drop [LeftMouse]" );
		
		} else {
			UIHUD.ShowNotification ( "Pick up [LeftMouse]" );
		
		}
	}
	
	// Interact
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive ) {
			if ( !isPickedUp ) {
				GameCore.GetPlayer().PickUpObject ( this );
				isPickedUp = true;
												
			} else {
				GameCore.GetPlayer().DropObject ();
				isPickedUp = false;
			
			}
		
			InvokePrompt ();
		}
	}
}