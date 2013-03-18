var core : GameCore;

function Start () {
}

function Update () {

}

function OnTriggerEnter ( other:Collider ) {
	core.SetInteractiveObject ( this.gameObject );
}

function OnTriggerExit ( other:Collider ) {
	core.SetInteractiveObject ( null );
}

function Interact () {
	if ( this.gameObject.GetComponent( "Conversation" ) ) {
		this.gameObject.GetComponent( "Conversation" ).EnterConversation();
	} else if ( this.gameObject.GetComponent( "Door" ) ) {
		this.gameObject.GetComponent( "Door" ).Toggle();
	}
}