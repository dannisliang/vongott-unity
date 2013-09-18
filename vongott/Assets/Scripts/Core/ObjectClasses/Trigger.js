#pragma strict

class Trigger extends MonoBehaviour {
	enum eTriggerActivation {
		Collision,
		PickUp,
		Die
	}
	
	var activation : eTriggerActivation;
	var fireOnce : boolean = true;
	var events : List.< GameEvent > = new List.< GameEvent > ();
	
	// Set activation
	function SetActivationType ( type : String ) {
		switch ( type ) {
			case "Collision":
				activation = eTriggerActivation.Collision;
				break;
			
			case "Pickup":
				activation = eTriggerActivation.PickUp;
				break;
				
			case "Die":
				activation = eTriggerActivation.Die;
				break;
		}	
	}
	
	// Check collision
	function OnTriggerEnter () {
		if ( fireOnce ) {
			this.GetComponent(BoxCollider).enabled = false;
		}
		
		Activate ();
	}
	
	// Activate trigger
	function Activate () {
		for ( var event : GameEvent in events ) {
			EventManager.Fire ( event );
		}
	}
	
	// Init
	function Start () {
		if ( GameCore.started ) {
			this.GetComponent(MeshRenderer).enabled = false;
		}
	}
}