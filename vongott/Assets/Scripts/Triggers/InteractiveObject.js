#pragma strict

@script RequireComponent(GUID)

class InteractiveObject extends MonoBehaviour {
	function OnTriggerEnter ( other : Collider ) {
		if ( other.GetComponent(Actor) ) {
			NPCCollide ( other.GetComponent(Actor) );
		}
	}
	
	function OnTriggerStay ( other : Collider ) {
		if ( !GameCore.started || other.gameObject != GameCore.GetPlayerObject() ) { return; }
		
		if ( GameCore.GetInteractiveObject() == null ) {
			GameCore.SetInteractiveObject ( this.gameObject );
			InvokePrompt ();
		}
	}
	
	function OnTriggerExit ( other:Collider ) {
		if ( !GameCore.started || other.gameObject != GameCore.GetPlayerObject() ) { return; }
		
		GameCore.SetInteractiveObject ( null );
		UIHUD.ShowNotification ( "" );
	}
	
	function NPCCollide ( a : Actor ) {}
	
	function InvokePrompt () {}
	
	function Interact () {}
	
	function UpdateObject () {}
	
	function Awake () {
		this.gameObject.tag = "dynamic";
	}
	
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
	}
	
	function Update () {
		if ( GameCore.GetInteractiveObject() == this.gameObject ) {
			Interact ();
		}
		
		UpdateObject ();
	
		if ( EditorCore.running && this.GetComponent ( SphereCollider ) && this.GetComponent ( SphereCollider ).enabled ) {
			this.GetComponent ( SphereCollider ).enabled = false;
		}
	}
}