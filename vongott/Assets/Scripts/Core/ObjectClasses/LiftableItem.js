#pragma strict

class LiftableItem extends InteractiveObject {
	public var isPickedUp : boolean = false;
		
	// Handle lifting
	public function OnPickup () {
		this.GetComponent ( Rigidbody ).useGravity = false;
	}
	
	public function OnDrop () {
		this.GetComponent ( Rigidbody ).useGravity = true;
	}
	
	// Interact
	override function Interact () {
		if ( !isPickedUp ) {
			GameCore.GetPlayer().PickUpObject ( this );
			isPickedUp = true;
											
		} else {
			GameCore.GetPlayer().DropObject ();
			isPickedUp = false;
		
		}
	}
}
