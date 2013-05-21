#pragma strict

import System.Text.RegularExpressions;

class Conversation {
	////////////////////
	// Prerequisites
	////////////////////
	// Classes
	private class Entry {
		var type : String;
		var groupType : String;
		
		var condition : String;
		var consequence : String;
		
		var speaker : String;
		var line : String;
		
		var canCancel : boolean;
		var useInput: boolean;
		
		var title: String;
		var instructions: String;
		
		var options : List.< Entry > = new List.< Entry >();
	}

	// Public vars
	var condition : String;
	var chapter : String;
	var scene : String;
	var name : String;
	var conversation : String;
	
	var entries : List.< Entry > = new List.< Entry >();
	var currentOption : int = 0;
	var currentEntry : int = 0;
	
	
	////////////////////
	// Conversation navigation
	////////////////////
	// Leave conversation
	function Exit () {
		OGRoot.GoToPage ( "HUD" );
		
		GameCore.ToggleControls ( true );
		currentEntry = 0;
	}
	
	// Display an entry
	function DisplayEntry () {
		var entry : Entry = entries[currentEntry];
		var speakerName : String;
		var speakerLine : String;
		
		// line
		if ( entry.type == "Line" ) {
			if ( entries[currentEntry].speaker == "NPC" ) {
				speakerName = name;
				
			} else if ( entries[currentEntry].speaker == "Player" ) {
				speakerName = GameCore.playerName;
			}
		
			if ( entries[currentEntry].line.Replace ( "Player", GameCore.playerName ) ) {
				speakerLine = entries[currentEntry].line.Replace ( "Player", GameCore.playerName );
			} else {
				speakerLine = entries[currentEntry].line;
			}
		
			UIConversation.SetName ( speakerName );
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
				speakerName = name;
				
				if ( entry.options[currentOption] ) {
					speakerLine = entry.options[currentOption].line;
				}
				
				UIConversation.SetName ( speakerName );
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
		return Regex.Split ( s, " | " )[i];
	}
	
	// Get flag
	function GetFlag ( entry : Entry ) : boolean {
		if ( entry.condition == null || entry.condition == "(none)" || entry.condition == "<condition>" || entry.condition == "" ) { return true; }
		
		var flag : String = SplitString ( entry.condition, 0 );
		var bool : boolean = SplitString ( entry.condition, 2 ) == "True";
		
		return FlagManager.GetFlag ( flag, bool );
	}
	
	// Set flag
	function SetFlag ( entry : Entry ) {		
		if ( entry.consequence == null || entry.consequence == "(none)" || entry.consequence == "<consequence>" || entry.consequence == "" ) { return; }
		
		var flag : String = SplitString ( entry.consequence, 0 );
		var bool : boolean = SplitString ( entry.consequence, 2 ) == "True";
		
		FlagManager.SetFlag ( flag, bool );
	}
	
	// Next entry
	function NextEntry () {		
		if ( currentEntry < entries.Count - 1 ) {
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
		if ( currentOption < entries[currentEntry].options.Count ) {
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
		UIConversation.convo = this;
				
		entries.Clear ();
		
		var file = Loader.LoadConversationToGame ( chapter + "/" + scene + "/" + name + "/" + conversation );
		var object : JSONObject = new JSONObject ( file );
		
		for ( var o : JSONObject in object.list ) {
			var entry = new Entry ();
			
			// line
			if ( o.GetField ( "type" ).str == "Line" ) {
				entry.type = o.GetField ( "type" ).str;
				
				entry.condition = o.GetField ( "condition" ).str;
				entry.consequence = o.GetField ( "consequence" ).str;
				entry.speaker = o.GetField ( "speaker" ).str;
				entry.line = o.GetField ( "line" ).str;
			
			// group
			} else if ( o.GetField ( "type" ).str == "Group" ) {
				entry.type = o.GetField ( "type" ).str;
				entry.groupType = o.GetField ( "groupType" ).str;
				
				for ( var opt : JSONObject in o.GetField ( "options" ).list ) {
					var option = new Entry ();
					
					option.consequence = opt.GetField ( "consequence" ).str;
					option.line = opt.GetField ( "line" ).str;
					
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