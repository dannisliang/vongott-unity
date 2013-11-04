#pragma strict

public class ConversationTree {
	var rootNodes : List.< ConversationRootNode > = new List.< ConversationRootNode > ();
}

public class ConversationRootNode {
	var auto : boolean = false;
	var connectedTo : ConversationNode;
}

public class ConversationNode {
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
	
	// Endconvo
	var action : String;
	var nextRoot : int = 0;
	
	// Exchange
	var credits : int;
	var item : String;
}

public class ConversationManager {
	private static var currentConvo : ConversationTree;
	private static var currentActor : Actor;
	private static var currentNode : ConversationNode;
	private static var endAction : String;
	private static var currentOption: int = 0;
	
	public static function SetSpeaker ( speaker : String, smoothCam : boolean ) {
		var speakerName : String;
				
		if ( speaker == "NPC" ) {
			speakerName = currentActor.displayName;
 			GameCamera.GetInstance().ConvoFocus ( GameCore.GetPlayer().talkingTo, smoothCam );
			
		} else if ( speaker == "Player" ) {
			speakerName = GameCore.playerName;
			GameCamera.GetInstance().ConvoFocus ( GameCore.GetPlayer(), smoothCam );

		}
					
		UIConversation.SetName ( speakerName );
	}
	
	private static function Exit () {
		OGRoot.GoToPage ( "HUD" );
		
		currentActor.StopTalking ( endAction );
		GameCore.GetPlayer().StopTalking ();
		
		GameCamera.GetInstance().RestorePosRot ( 1 );
	}
	
	public static function NextNode ( index : int ) {
		if ( currentNode.connectedTo.Count > index ) {
			currentNode = currentNode.connectedTo [ index ];
			DisplayNode ( false );
		} else {
			Exit ();
		}
	}
	
	public static function GetOptions () : int {
		return currentNode.lines.Count;
	}
	
	public static function StartConversation ( path : String, actor : Actor ) {
		currentConvo = Loader.LoadConversationTree ( path );
		currentActor = actor;
	
		GameCamera.GetInstance().StorePosRot();
		GameCore.GetPlayer().TalkTo ( actor );
		
		currentNode = currentConvo.rootNodes[actor.currentConvoRoot].connectedTo;
		
		OGRoot.GoToPage ( "Conversation" );
	
		DisplayNode ( true );
	}
	
	public static function DisplayNode ( smoothCam : boolean ) {
		var waitForInput : boolean = false;
		var nextNode : int = 0;
		
		switch ( currentNode.type ) {
			case "Speak":
				waitForInput = true;
				SetSpeaker ( currentNode.speaker, smoothCam );
				if ( currentNode.lines.Count <= 1 ) {
					UIConversation.SetLine ( currentNode.lines[0] );
				} else {
					for ( var i : int = 0; i < currentNode.lines.Count; i++ ) {
						if ( !String.IsNullOrEmpty(currentNode.lines[i]) ) {
							UIConversation.SetOption ( i, currentNode.lines[i] );
						}
					}
				}
				
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
				FlagManager.SetFlag ( currentNode.consequence, currentNode.consequenceBool );
				break;
				
			case "Exchange":
				EventManager.GiveItem ( currentNode.item, currentNode.credits );
				break;
				
			case "EndConvo":
				endAction = currentNode.action;
				currentActor.currentConvoRoot = currentNode.nextRoot;
				break;
		}		
						
		if ( !waitForInput ) {
			NextNode ( nextNode );
		}
	}
}