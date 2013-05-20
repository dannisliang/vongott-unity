#pragma strict

class Conversation {
	private class Entry {
		var type : String;
		
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

	var condition : String;
	var chapter : String;
	var scene : String;
	var name : String;
	var conversation : String;
	
	var entries : List.< Entry > = new List.< Entry >();
	var currentOption : int = 0;
	var currentEntry : int = 0;
	
	function Exit () {
		OGRoot.GoToPage ( "HUD" );
		
		GameCore.ToggleControls ( true );
		currentEntry = 0;
	}
	
	function DisplayEntry () {
		var entry : Entry = entries[currentEntry];
		
		if ( entry.type == "Line" ) {
			var speakerName : String;
			var speakerLine : String;
		
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
				
		} else if ( entry.type == "Group" ) {
			UIConversation.SetName ( GameCore.playerName );
		
			for ( var i = 0; i < entry.options.Count; i++ ) {
				UIConversation.SetOption ( i, entry.options[i].line );
			}
		
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
	
	function NextEntry () {		
		if ( currentEntry < entries.Count - 1 ) {
			currentEntry++;
			DisplayEntry ();
		} else {
			Exit ();
		}
	}
	
	function NextOption () {
	
	}
	
	function PreviousOption () {
	
	}
	
	function SelectOption () {
	
	}
	
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
				
				for ( var opt : JSONObject in object.GetField ( "options" ).list ) {
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
	
		DisplayEntry ();
	}
}

/* OLD CODE

import System.Xml;

class Conversation extends InteractiveObject {	
	var chapter : int;
	var scene : int;
	var actorName : String;
	var conversationName : String;
	
	@HideInInspector private var line_array = new Array();
	@HideInInspector private var current_line = 0;
	@HideInInspector private var in_convo = false; 
	@HideInInspector private var skip_line = false;
	@HideInInspector private var current_option = 0;
	@HideInInspector private var current_options = 0;
	
	
	////////////////////
	// Leave convo
	////////////////////
	function LeaveConversation () {
		GameCore.ToggleControls( true );
		
		OGRoot.GoToPage ( "HUD" );
		in_convo = false;
		current_line = 0;
		line_array = [];
	}
	
	
	////////////////////
	// Next line
	////////////////////
	function NextLine () {		
		// check if there are more lines to read
		if ( current_line >= line_array.Count ) {
			LeaveConversation();
			return;
		}
		
		var array = line_array[current_line];
		var type = array[0];
		var name : String;
		var text : String;
		var id : String;
		var flag : String;
		var option1 : String;
		var option2 : String;
		var option3 : String;
			
		// consequences for different types
		if ( type == "line" ) {
			if ( line_array[current_line][3] ) {
				if ( FlagManager.GetFlag( line_array[current_line][3] ) == false ) {
					skip_line = true;
					return;			
				}
			}
			
			name = line_array[current_line][1];
			text = line_array[current_line][2];
			
			if ( name == "(player)" ) {
				name = GameCore.playerName;
			}
			
			if ( text.Replace( "(player)", GameCore.playerName ) ) {
				text = text.Replace( "(player)", GameCore.playerName );
			}
			
			UIConversation.SetName ( name );
			UIConversation.SetLine ( text );
		
		} else if ( type == "machinima" ) {
			id = line_array[current_line][1];
		
			UIConversation.SetName ( type );
			UIConversation.SetLine ( id );
		
		} else if ( type == "prompt" ) {
			title = line_array[current_line][1];
			text = line_array[current_line][2];
			cancel = line_array[current_line][3];
			
			OGRoot.GoToPage ( "DialogBox" );
			UIDialogBox.Open ( title, text, true, ( cancel == "true" ), this );
		
		} else if ( type == "group" ) {
			current_option = 0;
			current_options = 0;
			UIConversation.HighlightLine ( 0 );
			
			UIConversation.SetName ( GameCore.playerName );			
									
			for ( var i = 1; i < line_array[current_line].Count; i++ ) {
				text = line_array[current_line][i];
				if ( text.Replace( "(player)", GameCore.playerName ) ) {
					text = text.Replace( "(player)", GameCore.playerName );
				}
	
				UIConversation.SetOption ( i-1, text.Split("|"[0])[0] );
				current_options++;
			}
		}
		
		// go to next line
		current_line++;
	}
	
	
	////////////////////
	// Choose line
	////////////////////
	function ChooseLine ( index : int ) {
		var attr = line_array[current_line-1][1 + index].ToString().Split("|"[0])[1]; 
		
		UIConversation.SetOption ( 0, "" );
		UIConversation.SetOption ( 1, "" );
		UIConversation.SetOption ( 2, "" );
		
		if ( attr == "cancel" ) {
			LeaveConversation();
		} else if ( attr == "" ) {
			NextLine();
		} else {
			FlagManager.SetFlag ( attr, true );
			NextLine();
		}
	}
	
	////////////////////
	// Enter convo
	////////////////////
	function EnterConversation () {
		if (!in_convo) {
			GameCore.ToggleControls( false );
		
		   	// send start message to HUD
			OGRoot.GoToPage("Conversation");
			in_convo = true;
			var current_convo = 0;
			
			// read XML document
			var xml_data = new XmlDocument();
			xml_data.Load( Application.dataPath + "/Conversations/" + chapter.ToString() + "/" + scene.ToString() + "/" + actorName + ".xml");
	
			// define XML root
			var node_list : XmlNodeList;
			var root : XmlNode = xml_data.DocumentElement;
		    node_list = root.SelectNodes("/scene/convo");
			
			// TODO: REWRITE THIS LOOP, IT'S STUPID
			// loop through convo tags and determine which one to display
			var convo_counter = 0;
			for ( var convo in node_list ) {	
				// if there is a flag and it's true, use this convo
				if ( convo.Attributes["flag"] ) {
					if ( FlagManager.GetFlag ( convo.Attributes["flag"].Value ) ) {
						// if there is an endquest attribute, end it
						if ( convo.Attributes["endquest"] ) {
							QuestManager.EndQuest ( convo.Attributes["endquest"].Value );
						}
						
						// if there is a startquest attribute, start it
						if ( convo.Attributes["startquest"] ) {
							QuestManager.StartQuest ( convo.Attributes["startquest"].Value );
						}
														
						// if there is a setflag attribute, set it
						if ( convo.Attributes["setflag"] ) {
							if ( !FlagManager.GetFlag ( convo.Attributes["setflag"].Value ) ) {
								FlagManager.SetFlag ( convo.Attributes["setflag"].Value, true );
								current_convo = convo_counter;
								break;
							}
						} else {
							current_convo = convo_counter;
							break;
						}
					}
				
				} else {
					// if there is an endquest attribute, end it
					if ( convo.Attributes["endquest"] ) {
						QuestManager.EndQuest ( convo.Attributes["endquest"].Value );
					}
					
					// if there is a startquest attribute, start it
					if ( convo.Attributes["startquest"] ) {
						QuestManager.StartQuest ( convo.Attributes["startquest"].Value );
					}
					
					// if there is a setflag attribute and it's not been set already, set it and use this convo
					if ( convo.Attributes["setflag"] ) {
						if ( !FlagManager.GetFlag ( convo.Attributes["setflag"].Value ) ) {
							FlagManager.SetFlag ( convo.Attributes["setflag"].Value, true );
							current_convo = convo_counter;
							break;
						}
						
					// if there are no flags involved, use this convo
					} else {
						current_convo = convo_counter;
						break;
						
					}			
				}
				convo_counter++;
			}
			
			// loop through lines for selected convo
			var node_counter = 0;
			for ( var node in node_list[current_convo].ChildNodes ) {
	        	var type = node.Name;
	        	var name : String;
				var text : String;
				var id : String;
				var flag : String;
	        	var option1 : String;
	        	var option2 : String;
	        	var option3 : String;
	        	
	        	// check for line types and insert them into the line array
	        	if ( type == "line" ) {
	        		name = node.Attributes["name"].Value;
	        		text = node.InnerText;
	       			
	       			// set flag if any
	       			if ( node.Attributes["flag"] ) {
	       				flag = node.Attributes["flag"].Value;
	        		} else {
	        			flag = "";
	        		}
	        		
	        		line_array[node_counter] = [type,name,text,flag];
	        	
	        	} else if ( type == "machinima" ) {
	        		id = node.Attributes["id"].Value;
	        		line_array[node_counter] = [type,id];
	        	
	        	} else if ( type == "prompt" ) {
	        		name = node.Attributes["title"].Value;
	        		text = node.Attributes["text"].Value;
	        		flag = node.Attributes["cancel"].Value;
	        		line_array[node_counter] = [type,name,text,flag];
	        	
	        	} else if ( type == "group" ) {
	        		line_array[node_counter] = new Array();
	        		line_array[node_counter][0] = type;
	        		
	        		var option_counter = 1;	        			        		
	        		for ( var option in node.ChildNodes ) {
	        			var attribute = "|";
	        			
	        			if ( option.Attributes["setflag"] ) {
	        				attribute = "|" + option.Attributes["setflag"].Value;
	        			} else if ( option.Attributes["action"] ) {
	        				attribute = "|" + option.Attributes["action"].Value;
	        			}
	        			
	        			line_array[node_counter][option_counter] = option.InnerText + attribute;
	        			
	        			option_counter++;
	        		}
	        	}
	        	node_counter++;
			}
		   	   
		   	// go to next line
		   	NextLine();
		}
	}
	
	
	////////////////////
	// Init
	////////////////////
	function Start () {
	
	}
	
	
	////////////////////
	// Update
	////////////////////
	function Update () {
		if ( in_convo ) {
			// Check if line should be skipped
			if ( skip_line ) {
				skip_line = false;
				current_line++;
				NextLine();
			}
			
			// check if there are options
			if ( UIConversation.highlight.activeSelf ) {
				if ( Input.GetKeyDown(KeyCode.F) ) {
					ChooseLine ( current_option );
				} else if ( ( Input.GetKeyDown(KeyCode.S) || Input.GetKeyDown(KeyCode.DownArrow) ) && current_option < current_options - 1 ) {
					current_option++;
					UIConversation.HighlightLine ( current_option );
					
				} else if ( ( Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.UpArrow) ) && current_option > 0 ) {
					current_option--;
					UIConversation.HighlightLine ( current_option );
				
				}
			
			// if not, just go to next line
			} else {
				if ( Input.GetKeyDown(KeyCode.F) || Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter) ) {
					NextLine ();
				}
			}
			
		// Interact
		} else if ( GameCore.GetInteractiveObject() == this.gameObject ) {
			UIHUD.ShowNotification ( "Talk [F]" );
			
			if ( Input.GetKeyDown(KeyCode.F) ) {
				EnterConversation();
			}
		}
	}
}

*/