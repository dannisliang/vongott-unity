function OnTriggerEnter ( other:Collider ) {
	GameCore.SetInteractiveObject ( this.gameObject );
}

function OnTriggerExit ( other:Collider ) {
	GameCore.SetInteractiveObject ( null );
	HUD.notification_message = "";
}

function Start () {
}

function Update () {
}