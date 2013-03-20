function Start () {
}

function Update () {

}

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