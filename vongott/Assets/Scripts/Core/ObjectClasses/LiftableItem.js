#pragma strict

class LiftableItem extends InteractiveObject {
	public var isPickedUp : boolean = false;
	
	// Prompt
	override function InvokePrompt () {
		if ( isPickedUp ) {
			UIHUD.ShowNotification ( "Drop [LeftMouse]" );
		
		} else {
			UIHUD.ShowNotification ( "Pick up [LeftMouse]" );
		
		}
	}
	
	// Handle lifting
	public function OnPickup () {
		this.GetComponent ( Rigidbody ).useGravity = false;
	}
	
	public function OnDrop () {
		this.GetComponent ( Rigidbody ).useGravity = true;
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