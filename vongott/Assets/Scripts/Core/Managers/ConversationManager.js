#pragma strict

//////////////////
// DEPRECATED: Use OCManager instead
//////////////////

public class ConversationTree {
	var rootNodes : List.< ConversationRootNode > = new List.< ConversationRootNode > ();
}

public class ConversationRootNode {
	var auto : boolean = false;
	var passive : boolean = false;
	var connectedTo : ConversationNode;
}

public class ConversationNode {
	var rootIndex : int = -1;
	var nodeIndex : int = -1;
	
	var type : String;
	var connectedTo : List.< ConversationNode > = new List.< ConversationNode >();

	// Speak
	var speaker : String;
	var lines : List.< String > = new List.< String >();
	
	// GameEvent
	var event : String;
	
	// Condition
	var condition : String;
	
	// Consequence
	var consequence : String;
	var consequenceBool : boolean;
	var questName : String;
	var questAction : String;

	// Endconvo
	var action : String;
	var nextRoot : int = 0;
	
	// Exchange
	var credits : int;
	var item : String;

	// Jump
	var jumpTo : int;
}

public class ConversationManager {
	private static var currentConvo : ConversationTree;
	private static var currentActor : Actor;
	private static var currentSupportActor : Actor;
	private static var currentNode : ConversationNode;
	private static var endAction : String;
	private static var currentOption: int = 0;
	private static var useSmoothCam : boolean = true;
	private static var passiveConvo : boolean = false;

	public static function SetSpeaker ( speaker : String ) {
		/*var speakerName : String;
				
		if ( speaker == "NPC2" && currentSupportActor != null ) {
			speakerName = currentSupportActor.displayName;
			currentSupportActor.talking = true;
 			GameCamera.GetInstance().ConvoFocus ( currentSupportActor, useSmoothCam );

		} else if ( speaker == "NPC" || speaker == "NPC2" ) {
			speakerName = currentActor.displayName;
 			GameCamera.GetInstance().ConvoFocus ( currentActor, useSmoothCam );
		
		} else if ( speaker == "Player" ) {
			speakerName = GameCore.playerName;
			GameCamera.GetInstance().ConvoFocus ( GameCore.GetPlayer(), useSmoothCam );

		}
					
		UIConversation.SetName ( speakerName );*/
	}
	
	private static function Exit () {
		if ( !passiveConvo ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
		}

		currentActor.StopTalking ( endAction );
		
		if ( currentSupportActor != null ) {
			currentSupportActor.talking = false;
		}

		GameCore.GetPlayer().StopTalking ();
		

		currentActor = null;
		currentSupportActor = null;

		GameCamera.GetInstance().RestorePosRot ( 1 );
		GameCore.GetInstance().SetControlsActive ( true, 1 );
	}

	public static function NextRoot ( index : int ) {
		currentActor.currentConvoRoot = index;

		// Set passive
		passiveConvo = currentConvo.rootNodes[currentActor.currentConvoRoot].passive;

		if ( !passiveConvo ) {
			OGRoot.GetInstance().GoToPage ( "Conversation" );
		}

		// Set current node
		currentNode = currentConvo.rootNodes[currentActor.currentConvoRoot].connectedTo;
		DisplayNode ();
	}

	public static function NextNode ( index : int ) {
		if ( currentNode.connectedTo.Count > index ) {
			currentNode = currentNode.connectedTo [ index ];
			DisplayNode ();
		} else {
			Exit ();
		}
	}
	
	public static function GetOptions () : int {
		return currentNode.lines.Count;
	}
	
	public static function CheckForcedConvo ( actor : Actor ) : boolean {
		if ( String.IsNullOrEmpty ( actor.conversationTree ) || actor.conversationTree == "(none)" ) { return false; }

		if ( actor.conversationTreeInstance == null ) {
			actor.conversationTreeInstance = Loader.LoadConversationTree ( actor.conversationTree );
		}

		if ( actor.currentConvoRoot >= actor.conversationTreeInstance.rootNodes.Count ) {
			return false;

		} else {
			var rootNode : ConversationRootNode = actor.conversationTreeInstance.rootNodes[actor.currentConvoRoot];
			
			return rootNode.auto;
		}
	}
	
	public static function StartConversation ( actor : Actor ) {
		// Set current conversation
		if ( actor.conversationTreeInstance == null ) {
			currentConvo = Loader.LoadConversationTree ( actor.conversationTree );
		} else {
			currentConvo = actor.conversationTreeInstance;
		}

		currentActor = actor;
		
		// Prepare to use camera transition
		useSmoothCam = true;
		GameCamera.GetInstance().StorePosRot();

		// Find support actor
		var actors : Actor [] = GameObject.FindObjectsOfType.<Actor>();
		var foundActor : Actor;
		
		for ( var i : int = 0; i < actors.Length; i++ ) {
			var sameActor : boolean = actors[i] == currentActor;
			var sameFloor : boolean = true;//Mathf.Abs ( actors[i].transform.position.y - currentActor.transform.position.y ) < 0.5;
			var nearest : boolean = foundActor == null || ( actors[i].transform.position - currentActor.transform.position ).sqrMagnitude < ( foundActor.transform.position - currentActor.transform.position ).sqrMagnitude;
			var patrolling : boolean = actors[i].pathType == Actor.ePathType.Patrolling && actors[i].path.Count > 0;

			if ( sameFloor && nearest && !patrolling && !sameActor ) {
				foundActor = actors[i];
			}
		}

		currentSupportActor = foundActor;
		
		if ( currentSupportActor ) {
			GameCore.Print ( "ConversationManager | Support actor: " + currentSupportActor.displayName );
		}

		// Send signal to player object		
		GameCore.GetPlayer().TalkTo ( actor );
	
		NextRoot ( currentActor.currentConvoRoot );	
	}
	
	public static function DisplayNode () {
		var waitForInput : boolean = false;
		var nextNode : int = 0;
		var forceRoot : int = -1;

		switch ( currentNode.type ) {
			case "Speak":
				waitForInput = true;
				SetSpeaker ( currentNode.speaker );
				if ( currentNode.lines.Count <= 1 ) {
					if ( passiveConvo ) {
						UIHUD.GetInstance().ShowTimedNotification ( currentNode.lines[0], 5 );
					} else {	
						UIConversation.SetLine ( currentNode.lines[0] );
					}
				
				} else if ( !passiveConvo ) {
					for ( var i : int = 0; i < currentNode.lines.Count; i++ ) {
						if ( !String.IsNullOrEmpty(currentNode.lines[i]) ) {
							UIConversation.SetOption ( i, currentNode.lines[i] );
						}
					}
				}
				
				// Camera transition has been done
				useSmoothCam = false;

				break;
				
			case "GameEvent":
				EventManager.Fire ( currentNode.event );
				break;
				
			case "Condition":
				if ( FlagManager.GetFlag ( currentNode.condition, true ) ) {
					nextNode = 1;
				} else {
					nextNode = 0;
				}
			
			case "Consequence":
				if ( !String.IsNullOrEmpty ( currentNode.consequence ) && currentNode.consequence != "(none)" ) {
					FlagManager.SetFlag ( currentNode.consequence, currentNode.consequenceBool );
				}
			        
				if ( !String.IsNullOrEmpty ( currentNode.questName ) && currentNode.questName != "(none)" ) {
					if ( currentNode.questAction == "Start" ) {
						QuestManager.StartQuest ( currentNode.questName );
					} else {
						QuestManager.EndQuest ( currentNode.questName );
					}
				}
				
				break;
				
			case "Exchange":
				var success : boolean = EventManager.GiveItem ( currentNode.item, currentNode.credits );
				
				if ( success ) {
					nextNode = 1;
				}
				break;
				
			case "EndConvo":
				endAction = currentNode.action;
				currentActor.currentConvoRoot = currentNode.nextRoot;
				break;

			case "Jump":
				forceRoot = currentNode.jumpTo;
				break;
		}		
		
		if ( passiveConvo ) {
			var timeOut : float = 5;
			
			while ( timeOut > 0 ) {
				timeOut -= Time.deltaTime;

				if ( timeOut <= 0 ) {
					if ( forceRoot > -1 ) {
						NextRoot ( forceRoot );
					} else {
						NextNode ( nextNode );
					}
				}
			}

		} else if ( !waitForInput ) {
			if ( forceRoot > -1 ) {
				NextRoot ( forceRoot );
			} else {
				NextNode ( nextNode );
			}
		}
	}
}
