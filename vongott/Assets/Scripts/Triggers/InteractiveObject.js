class InteractiveObject extends MonoBehaviour {
	function OnTriggerEnter ( other:Collider ) {
		if ( !GameCore.started ) { return; }
		
		if ( GameCore.GetInteractiveObject() != this.gameObject ) {
			GameCore.SetInteractiveObject ( this.gameObject );
			InvokePrompt ();
		}
	}
	
	function OnTriggerExit ( other:Collider ) {
		if ( !GameCore.started ) { return; }
		
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