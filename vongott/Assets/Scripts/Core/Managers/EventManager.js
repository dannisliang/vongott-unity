#pragma strict

class EventManager extends MonoBehaviour {
	// Conversation
	private var passiveConvo : boolean = false;
	private var choiceConvo : boolean = false;

	public function OnConversationStart ( tree : OCTree ) {
		passiveConvo = false;
	
		if ( tree.CurrentRootHasTag ( "passive" ) ) {
			passiveConvo = true;	
		
		} else {
			GameCamera.GetInstance().StorePosRot();
			GameCore.GetInstance().SetControlsActive ( false );
			OGRoot.GetInstance().GoToPage ( "Conversation" );
		
		}
	}

	public function OnSetLines ( strings : String [] ) {
		if ( strings.Length == 1 ) {
			if ( passiveConvo ) {
				UIHUD.GetInstance().ShowNotification ( strings[0] );

			} else {
				UIConversation.SetLine ( strings[0] );
		
			}

			choiceConvo = false;

		} else {
			for ( var i : int = 0; i < strings.Length; i++ ) {
				UIConversation.SetOption ( i, strings[i] );
			}

			choiceConvo = true;
		}
	}

	public function OnSetSpeaker ( speaker : OCSpeaker ) {
		GameCamera.GetInstance().ConvoFocus ( speaker.gameObject, !GameCamera.GetInstance().inConvo || choiceConvo );
		UIConversation.SetName ( speaker.id );
		GameCamera.GetInstance().inConvo = true;
	}

	public function OnConversationEnd () {
		OGRoot.GetInstance().GoToPage ( "HUD" );
		GameCore.GetInstance().SetControlsActive ( true );
		GameCamera.GetInstance().RestorePosRot ( 1 );
		GameCamera.GetInstance().inConvo = false;
	}

	// Character
	public function NextPathGoal ( t : OCTree ) {
		var c : OACharacter = t.gameObject.GetComponent.< OACharacter > ();

		if ( c ) {
			c.NextPathGoal ();
		}
	}

	// Travel
	public function TravelTo ( info : String ) {
		var split : String[] = info.Split ( ","[0] );
		var mapName : String = split[0];
		var spawnpointName : String;

		if ( split.Length > 1 ) {
			spawnpointName = split[1];
		}

		StartCoroutine ( GameCore.GetInstance().LoadLevel ( Application.dataPath + "/Maps/" + mapName + ".map", spawnpointName ) );
	}

	// Transactions
	public function GiveItem ( go : GameObject ) {
		var item : OSItem = go.GetComponent.< OSItem > ();

		if ( item ) {
			GameCore.GetInventory().AddItem ( item );
		}
	}
}
