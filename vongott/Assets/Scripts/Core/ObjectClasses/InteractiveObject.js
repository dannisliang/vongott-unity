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
		var item : OSItem = this.GetComponent.< OSItem > ();

		if ( character && character.team == 0 && character.behaviour != OABehaviour.ChasingTarget ) {
			UIHUD.GetInstance().ShowNotification ( "Talk" );
		
		} else if ( item ) {
			UIHUD.GetInstance().ShowNotification ( "Take" );
		
		}
	}
	
	function Interact () {
		var character : OACharacter = this.GetComponent.< OACharacter > ();
		var item : OSItem = this.GetComponent.< OSItem > ();

		if ( character && character.team == 0 && character.behaviour != OABehaviour.ChasingTarget ) {
			if ( !character.attackTarget ) {
				GameCore.GetConversationManager().SetSpeakers ( character.conversationTree.speakers, character.convoSpeakerObjects );
				GameCore.GetConversationManager().StartConversation ( character.conversationTree );
			}
		
		} else if ( item ) {
			GameCore.GetInventory().AddItemFromScene ( item );

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
