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
		
		var title: String;
		var instructions: String;
		
		var options : List.< ConvoEntry > = new List.< ConvoEntry >();
	}

	// Public vars
	var condition : String = "";
	var conditionBool : boolean = true;
	var startQuest : String = "";
	var endQuest : String = "";
	
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
		
		GameCore.ToggleControls ( true );
		currentEntry = 0;
		
		done = true;
		
		actor.StopTalking ( endAction );
	}
	
	// Set name
	function SetName () {
		var speakerName : String;
		
		if ( entries[currentEntry].speaker == "NPC" ) {
			speakerName = displayName;
			
		} else if ( entries[currentEntry].speaker == "Player" ) {
			speakerName = GameCore.playerName;
		}
	
		UIConversation.SetName ( speakerName );
	}
	
	// Display an entry
	function DisplayEntry () {
		var entry : ConvoEntry = entries[currentEntry];
		var speakerLine : String;
		
		// line
		if ( entry.type == "Line" ) {
			endAction = entries[currentEntry].endConvo;
			
			SetFlag ( entries[currentEntry] );
			
			SetName ();
		
			if ( entries[currentEntry].line.Replace ( "Player", GameCore.playerName ) ) {
				speakerLine = entries[currentEntry].line.Replace ( "Player", GameCore.playerName );
			} else {
				speakerLine = entries[currentEntry].line;
			}
		
			UIConversation.SetLine ( speakerLine );
		
		// group		
		} else if ( entry.type == "Group" ) {
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
				}
				
				SetName ();				
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
	
	// CHeck for end action
	function hasEndAction () : boolean {
		return endAction != "" && endAction != "(none)" && endAction != "<action>" && endAction != null;
	}
	
	// Next entry
	function NextEntry () {				
		if ( currentEntry < entries.Count - 1 && !hasEndAction () ) {
			currentEntry++;
			
			if ( GetFlag ( entries[currentEntry] ) ) {
				DisplayEntry ();
			} else {
				NextEntry ();
			}
		
		} else {
			Exit ();
		
		}
	}
	
	// Next option
	function NextOption () {
		if ( currentOption < entries[currentEntry].options.Count - 1 ) {
			currentOption++;
			UIConversation.HighlightOption ( currentOption );
		}
	}
	
	// Previous option
	function PreviousOption () {
		if ( currentOption > 0 ) {
			currentOption--;
			UIConversation.HighlightOption ( currentOption );
		}
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
		endAction = "";
		
		if ( endQuest != "" && endQuest != "(none)" ) {
			QuestManager.EndQuest ( endQuest );
		}
		
		UIConversation.convo = this;
				
		entries.Clear ();
		
		actor = GameCore.GetInteractiveObject().GetComponent(Actor);
		displayName = actor.displayName;
		
		var file = Loader.LoadConversationToGame ( chapter + "/" + scene + "/" + name + "/" + conversation );
		var object : JSONObject = new JSONObject ( file );
		
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
		
		GameCore.ToggleControls ( false );
	
		currentEntry = -1;
		NextEntry ();
	}
}