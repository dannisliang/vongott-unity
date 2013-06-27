class InteractiveObject extends MonoBehaviour {
	function OnTriggerEnter ( other:Collider ) {
		if ( GameCore.GetInteractiveObject() != this.gameObject ) {
			GameCore.SetInteractiveObject ( this.gameObject );
		}
	}
	
	function OnTriggerExit ( other:Collider ) {
		GameCore.SetInteractiveObject ( null );
		UIHUD.ShowNotification ( "" );
	}
}