function OnTriggerEnter ( other:Collider ) {
	GameCore.SetInteractiveObject ( this.gameObject );
}

function OnTriggerExit ( other:Collider ) {
	GameCore.SetInteractiveObject ( null );
	HUD.ShowNotification ( null );
}

function Start () {
}

function Update () {
}