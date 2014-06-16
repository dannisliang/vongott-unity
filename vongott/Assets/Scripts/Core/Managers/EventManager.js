#pragma strict

class EventManager extends MonoBehaviour {
	// Conversation
	private var passiveConvo : boolean = false;
	private var choiceConvo : boolean = false;
	private var speaker : OCSpeaker;

	public function OnConversationStart ( tree : OCTree ) {
	/*	passiveConvo = false;
	
		if ( tree.CurrentRootHasTag ( "passive" ) ) {
			passiveConvo = true;	
		
		} else {*/
			GameCamera.GetInstance().StorePosRot();
			GameCore.GetInstance().SetControlsActive ( false );
			OGRoot.GetInstance().GoToPage ( "Conversation" );
		
		//}
	}

	public function OnSetLines ( lines : OCSpeak.Line [] ) {
		var strings : String [] = new String [ lines.Length ];

		for ( var s : int = 0; s < strings.Length; s++ ) {
			strings[s] = lines[s].text;
		}
		
		if ( strings.Length == 1 ) {
			if ( passiveConvo ) {
				UIHUD.GetInstance().ShowNotification ( strings[0] );

			} else {
				UIConversation.SetLine ( strings[0] );
		
			}

			if ( lines[0].audio ) {
				speaker.gameObject.audio.clip = lines[0].audio;
				speaker.gameObject.audio.Play ();
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
		this.speaker = speaker;
		GameCamera.GetInstance().ConvoFocus ( speaker.gameObject, !GameCamera.GetInstance().inConvo || choiceConvo );
		UIConversation.SetName ( speaker.name );
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
	
	public function NextPathGoalRun ( t : OCTree ) {
		var c : OACharacter = t.gameObject.GetComponent.< OACharacter > ();

		if ( c ) {
			c.NextPathGoalRun ();
		}
	}
	
	public function TeleportToNextPathGoal ( t : OCTree ) {
		var c : OACharacter = t.gameObject.GetComponent.< OACharacter > ();

		if ( c ) {
			c.TeleportToNextPathGoal ();
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

	// Explosions
	public function OnExplosion ( grenade : OSGrenade ) {
		GameCore.GetDamageManager().ExplosionDamage ( grenade.transform.position, 2, 0.1 );	
	}

	// Flag
	public function SetFlag ( input : String ) {
		var split : String[] = input.Split ( ","[0] );
		var flag : String = split[0];
		var bool : boolean = true;
		
		if ( split.Length > 1 ) {
			bool = split[1] == "true";
		}

		GameCore.GetConversationManager().flags.Set ( flag, bool );

		GameCore.Print ( "Flag '" + flag + "' set to " + bool );
	}
}
