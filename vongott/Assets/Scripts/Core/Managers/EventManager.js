#pragma strict

class EventManager extends OCEventHandler {
	// Conversation
	private var choiceConvo : boolean = false;
	private var speaker : OCSpeaker;

	private function InitConvoCam () {
		GameCamera.GetInstance().StorePosRot();
		GameCore.GetInstance().controlsActive = false;
		OGRoot.GetInstance().GoToPage ( "Conversation" );
	}

	public function OnConversationStart ( tree : OCTree ) {
		var speakers : OCSpeaker[] = GameCore.GetConversationManager().speakers;
		for ( var i : int = 0; i < speakers.Length; i++ ) {
			var go : GameObject = speakers[i].gameObject;
			
			if ( go ) {
				var a : OACharacter = go.GetComponent.< OACharacter > ();

				if ( a ) {
					a.inConversation = true;
				}
			}
		}
	}

	public function OnSelectOption ( i : int ) {
		UIConversation.OnSelectOption ( i );
	}

	public function OnObjectiveCompleted ( quest : OCQuests.Quest, i : int ) {
		GameCore.Print ( "Objective completed: " + quest.title + " - " + i );
	}

	public function OnSetSpeaker ( speaker : OCSpeaker, node : OCSpeak ) {
		this.speaker = speaker;
		var strings : String [] = new String [ node.lines.Length ];

		for ( var s : int = 0; s < strings.Length; s++ ) {
			strings[s] = node.lines[s].text;
		}
		
		if ( node.smalltalk ) {
			if ( OGRoot.GetInstance().currentPage.pageName == "Conversation" ) {
				OnConversationEnd ();
			}

			UIHUD.GetInstance().ShowNotification ( strings[node.index] );

		} else {
			if ( OGRoot.GetInstance().currentPage.pageName != "Conversation" ) {
				InitConvoCam ();
			}
			
			GameCamera.GetInstance().ConvoFocus ( speaker.gameObject );
			UIConversation.SetName ( speaker.name );
			GameCamera.GetInstance().inConvo = true;

			var c : OACharacter = speaker.gameObject.GetComponent.< OACharacter > ();
			
			if ( strings.Length == 1 ) {
				UIConversation.SetLine ( strings[0] );
			
				c.convoFacing = node.lines[0].facing;

				var go : GameObject = c.facingObject;
				var ch : OACharacter = go.GetComponent.< OACharacter > ();
				var p : Player = go.GetComponent.< Player > ();

				if ( p ) {

				} else if ( ch ) {
					for ( var i : int = 0; i < ch.convoSpeakerObjects.Length; i++ ) {
						if ( c.gameObject == ch.convoSpeakerObjects [ i ] ) {
							ch.convoFacing = i;
						}
					}

				}

				choiceConvo = false;

			} else {
				for ( i = 0; i < strings.Length; i++ ) {
					UIConversation.SetOption ( i, strings[i] );
				}

				choiceConvo = true;
			}
		}
	}

	public function OnConversationEnd () {
		if ( OGRoot.GetInstance().currentPage.pageName == "Conversation" ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
			GameCore.GetInstance().controlsActive = true;
			GameCamera.GetInstance().RestorePosRot ();
			GameCamera.GetInstance().inConvo = false;
		}
	}

	// Player
	public function OnDeath () {
		GameCamera.GetInstance ().controller.state = eCameraState.ThirdPerson;
		GameCamera.GetInstance ().controller.distance = 5;

		OGRoot.GetInstance().GoToPage ( "Dead" );
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

	// Skills
	private var savedShaders : Dictionary.< Material, Shader > = new Dictionary.< Material, Shader > ();
	
	private function ChangeAllCharacterShaders () {
		savedShaders.Clear ();

		var newShader : Shader = Shader.Find ( "Vongott/XRayNoZ" );

		for ( var a : OACharacter in GameCore.GetInstance().levelContainer.GetComponentsInChildren.< OACharacter > () ) {
			var renderer : SkinnedMeshRenderer = a.GetComponentInChildren.< SkinnedMeshRenderer > ();

			for ( var m : Material in renderer.materials ) {
				savedShaders.Add ( m, m.shader );
				m.shader = newShader;
				m.SetColor ( "_Color", GameCore.GetInstance().highlightColor );
			}
		}
	}

	private function RestoreAllCharacterShaders () {
		if ( savedShaders.Count < 1 ) { return; }
		
		for ( var a : OACharacter in GameCore.GetInstance().levelContainer.GetComponentsInChildren.< OACharacter > () ) {
			var renderer : SkinnedMeshRenderer = a.GetComponentInChildren.< SkinnedMeshRenderer > ();

			for ( var m : Material in renderer.materials ) {
				m.SetColor ( "_Color", Color.white );
				m.shader = savedShaders [ m ];
			}
		}

		savedShaders.Clear ();
	}

	public function OnActivateSkill ( skill : OSSkillTree.Skill ) {
		SFXManager.GetInstance().Play ( "aug_on", GameCore.GetPlayer().audio );

		switch ( skill.name ) {
			case "Reflexes":
				GameCore.GetInstance().SetTimeScaleGoal ( skill.GetAttributeValue ( "Time scale" ) / 100 );
				break;
		
			case "Repulse":
				var center : Vector3 = GameCore.GetPlayer().transform.position;
				var radius : float = 10;
				var up : float = 1;
				var dt : float = 1 / GameCore.GetInstance().timeScale;
				var force : float = skill.GetAttributeValue ( "Force" ) * dt;

				var colliders : Collider[] = Physics.OverlapSphere ( center, 10 );

				for ( var c : Collider in colliders ) {
					var a : OACharacter = c.GetComponent.< OACharacter > ();
					
					if ( a ) {
						a.KnockUnconcious ();

						for ( var rb : Rigidbody in a.GetComponentsInChildren.< Rigidbody > () ) {
							rb.AddExplosionForce ( force, center, radius, up );
						}
					}
				}

				GameCore.GetPlayer().stats.mp -= skill.mpCost;
				skill.active = false;
				OGRoot.GetInstance().GoToPage ( "HUD" );
				GameCore.GetInstance().SetPause ( false );

				break;

			case "X-Ray":
				ChangeAllCharacterShaders ();
				break;

			case "Cloak":
				GameCore.GetPlayer().SetInvisible ( true );
				break;
			
			case "Shield":
				GameCore.GetPlayer().StartShield ();
				break;
			
			case "Health":
				GameCore.GetPlayer().StartAutoHeal ( skill.GetAttributeValue ( "Recharge" ) );
				break;
		}
	
	}
	
	public function OnDeactivateSkill ( skill : OSSkillTree.Skill ) {
		SFXManager.GetInstance().Play ( "aug_off", GameCore.GetPlayer().audio );

		switch ( skill.name ) {
			case "Reflexes":
				GameCore.GetInstance().SetTimeScaleGoal ( 1.0 );
				break;

			case "X-Ray":
				RestoreAllCharacterShaders ();
				break;
			
			case "Cloak":
				GameCore.GetPlayer().SetInvisible ( false );
				break;
			
			case "Shield":
				GameCore.GetPlayer().StopShield ();
				break;
			
			case "Health":
				GameCore.GetPlayer().StopAutoHeal ();
				break;
		}
	}

	public function OnDeactivateAllSkills () {
		GameCore.GetInstance().SetTimeScaleGoal ( 1.0 );
		RestoreAllCharacterShaders ();
		GameCore.GetPlayer().SetInvisible ( false );
		GameCore.GetPlayer().StopShield ();
		GameCore.GetPlayer().StopAutoHeal ();
	}

	// Subtitles
	public function OnPlayBark ( bark : OACharacter.Bark ) {
		UIHUD.GetInstance().ShowTimedNotification ( bark.subtitle, 5 );
	}

	// Music
	public function OnChaseStart () {
		// TODO: Play chase music
	}

	public function OnSeekingStart () {
		// TODO: Seeking music?
	}
}
