#pragma strict

class EventManager extends OCEventHandler {
	// Conversation
	private var choiceConvo : boolean = false;
	private var speaker : OCSpeaker;

	private function InitConvoCam () {
		GameCamera.GetInstance().StorePosRot();
		GameCore.GetInstance().SetControlsActive ( false );
		OGRoot.GetInstance().GoToPage ( "Conversation" );
	}

	public function OnConversationStart ( tree : OCTree ) {
	}

	public function OnSelectOption ( i : int ) {
		UIConversation.OnSelectOption ( i );
	}

	public function OnSetSpeaker ( speaker : OCSpeaker, node : OCSpeak ) {
		this.speaker = speaker;
		var strings : String [] = new String [ node.lines.Length ];

		for ( var s : int = 0; s < strings.Length; s++ ) {
			strings[s] = node.lines[s].text;
		}
		
		if ( node.smalltalk ) {
			UIHUD.GetInstance().ShowNotification ( strings[node.index] );

		} else {
			if ( OGRoot.GetInstance().currentPage.pageName != "Conversation" ) {
				InitConvoCam ();
			}
			
			GameCamera.GetInstance().ConvoFocus ( speaker.gameObject, !GameCamera.GetInstance().inConvo || choiceConvo );
			UIConversation.SetName ( speaker.name );
			GameCamera.GetInstance().inConvo = true;
			
			if ( strings.Length == 1 ) {
				UIConversation.SetLine ( strings[0] );

				choiceConvo = false;

			} else {
				for ( var i : int = 0; i < strings.Length; i++ ) {
					UIConversation.SetOption ( i, strings[i] );
				}

				choiceConvo = true;
			}
		}
	}

	public function OnConversationEnd () {
		if ( OGRoot.GetInstance().currentPage.pageName == "Conversation" ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
			GameCore.GetInstance().SetControlsActive ( true );
			GameCamera.GetInstance().RestorePosRot ();
			GameCamera.GetInstance().inConvo = false;
		}
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
