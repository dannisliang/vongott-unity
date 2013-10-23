#pragma strict

@script RequireComponent(GUID)

class InteractiveObject extends MonoBehaviour {
	function Focus () {
		var intObj : InteractiveObject = GameCore.GetInteractiveObject();
		if ( intObj == this || ( intObj && intObj.GetComponent ( LiftableItem ) && intObj.GetComponent ( LiftableItem ).isPickedUp ) ) { return; }

		GameCore.SetInteractiveObject ( this );
		InvokePrompt ();		
	}
	
	function Unfocus () {				
		if ( GameCore.GetInteractiveObject() == this ) {
			GameCore.SetInteractiveObject ( null );
			UIHUD.ShowNotification ( "" );
		}
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
		UpdateObject ();
	}
}