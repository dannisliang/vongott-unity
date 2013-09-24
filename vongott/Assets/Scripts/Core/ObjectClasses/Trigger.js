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
	
	var boundingBoxMaterial : Material;
	
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
	function OnDisable () {
		if ( Camera.main && Camera.main.GetComponent(EditorCamera) ) {
			Camera.main.GetComponent(EditorCamera).drawBoxes.Remove ( this.gameObject );
		}
	}
	
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
		
		if ( Camera.main && Camera.main.GetComponent(EditorCamera) && !this.GetComponent(InteractiveObject) ) {
			Camera.main.GetComponent(EditorCamera).drawBoxes.Add ( this.gameObject );
		}
	}
}