#pragma strict

@script RequireComponent(GUID)

class Trigger extends MonoBehaviour {
	enum eTriggerActivation {
		Collision,
		Death,
		EndConvo,
		PickUp
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
				
			case "Death":
				activation = eTriggerActivation.Death;
				break;
				
			case "EndConvo":
				activation = eTriggerActivation.EndConvo;
				break;
		}	
	}
	
	// Check collision
	function OnTriggerEnter () {
		if ( activation != eTriggerActivation.Collision ) { return; }
		
		Activate ();
	}
	
	// Activate trigger
	function Activate () {
		for ( var event : GameEvent in events ) {
			EventManager.Fire ( event );
		}
		
		if ( fireOnce ) {
			this.GetComponent(BoxCollider).enabled = false;
		}
	}
	
	// Init
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
		
		if ( GameCore.started ) {
			this.GetComponent(MeshRenderer).enabled = false;
		}
	}
}