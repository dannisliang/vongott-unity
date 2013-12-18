#pragma strict

class Wallet extends InteractiveObject {
	var creditAmount : int = 0;
	
	function Start () {		
		if ( EditorCore.running ) {
			Destroy ( this.rigidbody );			
		}
	}
	
	function Update () {
		if ( this.rigidbody && this.rigidbody.isKinematic ) {
			this.rigidbody.isKinematic = false;
		}
	}
	
	override function Interact () {
		InventoryManager.GetInstance().ChangeCredits ( creditAmount );
		Destroy ( this.gameObject );
		GameCore.SetInteractiveObject ( null );
		UIHUD.ShowTimedNotification ( "Picked up " + creditAmount + " credits", 2 );
	}
}
