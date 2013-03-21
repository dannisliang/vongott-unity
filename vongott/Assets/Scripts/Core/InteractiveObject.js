function OnTriggerEnter ( other:Collider ) {
	GameCore.SetInteractiveObject ( this.gameObject );
}

function OnTriggerExit ( other:Collider ) {
	GameCore.SetInteractiveObject ( null );
}

function Interact () {
	if ( this.gameObject.GetComponent( "Conversation" ) ) {
		this.gameObject.GetComponent( "Conversation" ).EnterConversation();
	} else if ( this.gameObject.GetComponent( "Door" ) ) {
		this.gameObject.GetComponent( "Door" ).Toggle();
	}
}

function Start () {
}

function Update () {
	if ( Input.GetKeyDown(KeyCode.F) && HUD.hud_active ) {
		if ( GameCore.GetInteractiveObject() == this.gameObject ) {
			Interact();
		}
	}
}