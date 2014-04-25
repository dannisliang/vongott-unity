#pragma strict

class InteractiveObject extends MonoBehaviour {
	function Focus () {
		var intObj : InteractiveObject = GameCore.GetInteractiveObject();
		if ( intObj == this || ( intObj && intObj.GetComponent ( LiftableItem ) && intObj.GetComponent ( LiftableItem ).isPickedUp ) ) { return; }

		GameCore.SetInteractiveObject ( this );
		
		InvokePrompt ();
	}
	
	function Unfocus () {				
		if ( GameCore.GetInteractiveObject() == this ) {
			GameCore.SetInteractiveObject ( null );
			UIHUD.GetInstance().ShowNotification ( "" );
		}
	}
	
	function NPCCollide ( c : OACharacter ) {}
	
	function InvokePrompt () {
		var character : OACharacter = this.GetComponent.< OACharacter > ();

		if ( character ) {
			UIHUD.GetInstance().ShowNotification ( "Talk" );
		}
	}
	
	function Interact () {
		var character : OACharacter = this.GetComponent.< OACharacter > ();

		if ( character ) {
			if ( !character.isEnemy ) {
				GameCore.GetConversationManager().StartConversation ( character.conversationTree );
			}
		}
	}
	
	function UpdateObject () {}
	
	function Awake () {
	}
	
	function OnCollisionEnter ( collision : Collision ) {
		var other : GameObject = collision.gameObject;

		if ( other.GetComponent.< OACharacter > () ) {
			NPCCollide ( other.GetComponent.< OACharacter > () );
		}
	}
}
