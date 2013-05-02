class InteractiveObject extends MonoBehaviour {
	function OnTriggerEnter ( other:Collider ) {
		GameCore.SetInteractiveObject ( this.gameObject );
	}
	
	function OnTriggerExit ( other:Collider ) {
		GameCore.SetInteractiveObject ( null );
		UIHUD.ShowNotification ( "" );
	}
}