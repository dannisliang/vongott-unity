#pragma strict

class LiftableItem extends InteractiveObject {
	public var isPickedUp : boolean = false;
		
	// Handle lifting
	public function OnPickup () {
		this.GetComponent ( Rigidbody ).useGravity = false;

		this.GetComponent.< MeshRenderer >().material.SetColor ( "_Color", new Color ( 1, 1, 1, 0.5 ) );
	}
	
	public function OnDrop () {
		this.GetComponent ( Rigidbody ).useGravity = true;
		
		this.GetComponent.< MeshRenderer >().material.SetColor ( "_Color", new Color ( 1, 1, 1, 1 ) );
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
