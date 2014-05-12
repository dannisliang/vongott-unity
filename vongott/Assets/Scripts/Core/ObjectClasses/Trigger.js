#pragma strict

class Trigger extends MonoBehaviour {
	enum eTriggerActivation {
		Collision,
		Death,
		EndConvo,
		PickUp
	}
		
	var activation : eTriggerActivation;
	var fireOnce : boolean = true;
	var events : List.< String > = new List.< String > ();
	
	var boundingBoxMaterial : Material;
	
	// Set activation
	public function SetActivationType ( type : String ) {
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
	
	// Death
	public function OnDeath () {
		if ( activation == eTriggerActivation.Death ) {
			Activate ();
		}
	}

	// Check collision
	public function OnTriggerEnter ( collider : Collider ) {
		if ( activation != eTriggerActivation.Collision || collider.gameObject != GameCore.GetPlayerObject() ) { return; }
		
		Activate ();
	}
	
	// Activate trigger
	public function Activate () {
		for ( var event : String in events ) {
			GameCore.GetEventManager().SendMessage ( event, SendMessageOptions.DontRequireReceiver );
		}
		
		if ( fireOnce ) {
			this.GetComponent(BoxCollider).enabled = false;
		}
	}
}
