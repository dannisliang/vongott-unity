class InteractiveObject extends MonoBehaviour {
	function OnTriggerEnter ( other:Collider ) {
		if ( GameCore.GetInteractiveObject() != this.gameObject ) {
			GameCore.SetInteractiveObject ( this.gameObject );
			InvokePrompt ();
		}
	}
	
	function OnTriggerExit ( other:Collider ) {
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