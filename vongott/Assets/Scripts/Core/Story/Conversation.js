#pragma strict

import System.Text.RegularExpressions;

class Conversation {
	////////////////////
	// Prerequisites
	////////////////////
	// Classes
	private class ConvoEntry {
		var type : String;
		var groupType : String;
		
		var condition : String;
		var conditionBool : boolean;
		var consequence : String;
		var consequenceBool : boolean;
		
		var speaker : String;
		var line : String;
		
		var canCancel : boolean;
		var endConvo : String;
		var useInput: boolean;
		var gameEvent : String;
		
		var title: String;
		var instructions: String;
		
		var options : List.< ConvoEntry > = new List.< ConvoEntry >();
	}

	// Public vars
	var condition : String = "";
	var conditionBool : boolean = true;
	var startQuest : String = "";
	var endQuest : String = "";
	var forced : boolean = false;
	
	var chapter : String;
	var scene : String;
	var name : String;
	var conversation : String;
	
	var entries : List.< ConvoEntry > = new List.< ConvoEntry >();
	var currentOption : int = 0;
	var currentEntry : int = 0;
	
	var done : boolean = false;
	var displayName : String;
	

	// Private vars
	private var endAction : String = "";
	private var gameEvent : String = "";
	private var actor : Actor;
	
	////////////////////
	// Conversation navigation
	////////////////////
	// Leave conversation
	function Exit () {
		if ( startQuest != "" && startQuest != "(none)" ) {
			QuestManager.StartQuest ( startQuest );
		}
		
		OGRoot.GoToPage ( "HUD" );
		
		currentEntry = 0;
		
		done = true;
		
		actor.StopTalking ( endAction );
		
		GameCamera.GetInstance().RestorePosRot ( 1 );
	}
	
	// Set speaker
	function SetSpeaker ( entry : ConvoEntry, smoothCam : boolean ) {
		var speakerName : String;
				
		if ( entry.speaker == "NPC" ) {
			speakerName = displayName;
 			GameCamera.GetInstance().ConvoFocus ( GameCore.GetPlayer().talkingTo, smoothCam );
			
		} else if ( entry.speaker == "Player" ) {
			speakerName = GameCore.playerName;
			GameCamera.GetInstance().ConvoFocus ( GameCore.GetPlayer(), smoothCam );

		}
					
		UIConversation.SetName ( speakerName );
	}
	
	// Display an entry
	function DisplayEntry ( smoothCam : boolean ) {
		var entry : ConvoEntry = entries[currentEntry];
		var speakerLine : String;
		
		// line
		if ( entry.type == "Line" ) {
			endAction = entry.endConvo;
			gameEvent = entry.gameEvent;
			
			SetFlag ( entry );
			
			SetSpeaker ( entry, smoothCam );
		
			if ( entry.line.Replace ( "Player", GameCore.playerName ) ) {
				speakerLine = entry.line.Replace ( "Player", GameCore.playerName );
			} else {
				speakerLine = entry.line;
			}
		
			UIConversation.SetLine ( speakerLine );
		
		// group		
		} else if ( entry.type == "Group" ) {
			SetSpeaker ( entry, smoothCam );
			
			// query
			if ( entry.groupType == "Query" ) {
				UIConversation.SetName ( GameCore.playerName );
			
				for ( var i = 0; i < entry.options.Count; i++ ) {
					if ( entry.options[i].line.Replace ( "Player", GameCore.playerName ) ) {
						speakerLine = entry.options[i].line.Replace ( "Player", GameCore.playerName );
					} else {
						speakerLine = entry.options[i].line;
					}
					
					UIConversation.SetOption ( i, speakerLine );
				}
			
			// response
			} else {				
				if ( entry.options[currentOption] ) {
					speakerLine = entry.options[currentOption].line;
					SetFlag ( entry.options[currentOption] );
					
					endAction = entry.options[currentOption].endConvo;
					gameEvent = entry.options[currentOption].gameEvent;
				}
				
				SetSpeaker ( entry, smoothCam );				
				UIConversation.SetLine ( speakerLine );
			}
		
		// dialog box
		} else if ( entry.type == "DialogBox" ) {
			UIDialogBox.convo = this;
			UIDialogBox.action = function () {
				if ( UIDialogBox.input.text != "" ) {
					GameCore.playerName = UIDialogBox.input.text;
				}
			};
					
			OGRoot.GoToPage ( "DialogBox" );
			UIDialogBox.Open ( entry.title, entry.instructions, entry.useInput, entry.canCancel );
		
		}
	}
	
	// Split string
	function SplitString ( s : String, i : int ) : String {
		var strings : String[] = Regex.Split ( s, " | " );
		
		if ( i >= strings.Length ) {
			return "True";
		} else {
			return strings[i];
		}
	}
	
	// Get flag
	function GetFlag ( entry : ConvoEntry ) : boolean {
		if ( entry.condition == null || entry.condition == "(none)" || entry.condition == "<condition>" || entry.condition == "" ) { return true; }
				
		return FlagManager.GetFlag ( entry.condition, entry.conditionBool );
	}
	
	// Set flag
	function SetFlag ( entry : ConvoEntry ) {		
		if ( entry.consequence == null || entry.consequence == "(none)" || entry.consequence == "<consequence>" || entry.consequence == "" ) { return; }
				
		FlagManager.SetFlag ( entry.consequence, entry.consequenceBool );
	}
	
	// Check for end action
	function HasEndAction () : boolean {
		return endAction != "" && endAction != "(none)" && endAction != "<action>" && endAction != null;
	}
	
	// Check for GameEvent
	function HasGameEvent () : boolean {
		return gameEvent != "" && gameEvent != "(none)" && endAction != null;
	}
	
	// Next entry
	function NextEntry () {
		NextEntry ( false );
	}
	
	function NextEntry ( smoothCam : boolean ) {				
		if ( HasGameEvent () ) {
			EventManager.Fire ( gameEvent );
		}
		
		if ( currentEntry < entries.Count - 1 && !HasEndAction () ) {
			currentEntry++;
						
			if ( GetFlag ( entries[currentEntry] ) ) {
				DisplayEntry ( smoothCam );
			} else {
				NextEntry ( smoothCam );
			}
		
		} else {
			Exit ();
		
		}
	}
	
	// Next option
	function NextOption () {
		if ( currentOption < entries[currentEntry].options.Count - 1 ) {
			HighlightOption ( currentOption + 1 );
		}
	}
	
	// Previous option
	function PreviousOption () {
		if ( currentOption > 0 ) {
			HighlightOption ( currentOption - 1 );
		}
	}
	
	// Highlight option
	function HighlightOption ( i : int ) {
		currentOption = i;
		UIConversation.HighlightOption ( currentOption );
	}
	
	// Select option
	function SelectOption () {
		SetFlag ( entries[currentEntry].options[currentOption] );
		NextEntry ();

	}
	
	
	////////////////////
	// Init
	////////////////////
	function Init () {		
		GameCamera.GetInstance().StorePosRot();
		
		endAction = "";
		
		if ( endQuest != "" && endQuest != "(none)" ) {
			QuestManager.EndQuest ( endQuest );
		}
		
		UIConversation.convo = this;
				
		entries.Clear ();
		
		actor = GameCore.GetInteractiveObject().GetComponent(Actor);
		displayName = actor.displayName;
		
		var file : String = Loader.LoadConversationToGame ( chapter + "/" + scene + "/" + name + "/" + conversation );
		var object : JSONObject = new JSONObject ( file, false );
		
		for ( var obj : Object in object.list ) {
			var o : JSONObject = obj as JSONObject;
			var entry = new ConvoEntry ();
			
			// line
			if ( o.GetField ( "type" ).str == "Line" ) {
				entry.type = o.GetField ( "type" ).str;
				
				entry.condition = o.GetField ( "condition" ).str;
				entry.conditionBool = o.GetField ( "conditionBool" ).b;
				entry.consequence = o.GetField ( "consequence" ).str;
				entry.consequenceBool = o.GetField ( "consequenceBool" ).b;
				entry.speaker = o.GetField ( "speaker" ).str;
				entry.line = o.GetField ( "line" ).str;
				entry.endConvo = o.GetField ( "endConvo" ).str;
				if ( o.HasField ( "gameEvent" ) ) {
					entry.gameEvent = o.GetField ( "gameEvent" ).str;
				}
			
			// group
			} else if ( o.GetField ( "type" ).str == "Group" ) {
				
				entry.condition = o.GetField ( "condition" ).str;
				entry.conditionBool = o.GetField ( "conditionBool" ).b;
				entry.type = o.GetField ( "type" ).str;
				entry.groupType = o.GetField ( "groupType" ).str;
				entry.speaker = o.GetField ( "speaker" ).str;
				
				for ( var list : Object in o.GetField ( "options" ).list as Object ) {
					var opt : JSONObject = list as JSONObject;
					var option = new ConvoEntry ();
					
					option.consequence = opt.GetField ( "consequence" ).str;
					option.consequenceBool = opt.GetField ( "consequenceBool" ).b;
					option.line = opt.GetField ( "line" ).str;
					option.endConvo = opt.GetField ( "endConvo" ).str;
					if ( opt.HasField ( "gameEvent" ) ) {
						option.gameEvent = opt.GetField ( "gameEvent" ).str;
					}
					
					entry.options.Add ( option );	
				}
			
			// dialog box
			} else if ( o.GetField ( "type" ).str == "DialogBox" ) {
				entry.type = o.GetField ( "type" ).str;
			
				entry.canCancel = o.GetField ( "canCancel" ).str == "True";
				entry.useInput = o.GetField ( "useInput" ).str == "True";
				entry.title = o.GetField ( "title" ).str;
				entry.instructions = o.GetField ( "instructions" ).str;
				
			}
			
			entries.Add ( entry );
		}
		
		OGRoot.GoToPage ( "Conversation" );
	
		currentEntry = -1;
		NextEntry ( true );
	}
}