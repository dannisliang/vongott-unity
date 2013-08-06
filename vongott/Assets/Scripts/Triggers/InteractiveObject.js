class InteractiveObject extends MonoBehaviour {
	function OnTriggerEnter ( other:Collider ) {
		if ( !GameCore.started || other.gameObject != GameCore.GetPlayerObject() ) { return; }
		
		if ( GameCore.GetInteractiveObject() != this.gameObject ) {
			GameCore.SetInteractiveObject ( this.gameObject );
			InvokePrompt ();
		}
	}
	
	function OnTriggerExit ( other:Collider ) {
		if ( !GameCore.started || other.gameObject != GameCore.GetPlayerObject() ) { return; }
		
		GameCore.SetInteractiveObject ( null );
		UIHUD.ShowNotification ( "" );
	}
	
	function InvokePrompt () {}
	
	function Interact () {}
	
	function Update () {
		if ( GameCore.GetInteractiveObject() == this.gameObject ) {
			Interact ();
		}
	}
}