#pragma strict

class Wallet extends InteractiveObject {
	var creditAmount : int = 0;
	
	function Start () {		
		if ( !GameCore.running ) {
			Destroy ( this.rigidbody );			
		}
	}
	
	function Update () {
		if ( this.rigidbody && this.rigidbody.isKinematic ) {
			this.rigidbody.isKinematic = false;
		}
	}
	
	override function Interact () {
		GameCore.GetInventory().ChangeCurrencyAmount ( "Credits", creditAmount );
		Destroy ( this.gameObject );
		GameCore.SetInteractiveObject ( null );
		UIHUD.GetInstance().ShowTimedNotification ( "Picked up " + creditAmount + " credits", 2 );
	}
}
