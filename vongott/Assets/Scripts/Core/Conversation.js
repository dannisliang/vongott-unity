import System.Xml;

class Conversation extends InteractiveObject {	
	var chapter : int;
	var scene : int;
	var actorName : String;
	
	@HideInInspector private var line_array = new Array();
	@HideInInspector private var current_line = 0;
	@HideInInspector private var in_convo = false; 
	@HideInInspector private var skip_line = false;
	@HideInInspector private var current_option = 0;
	
	
	////////////////////
	// Leave convo
	////////////////////
	function LeaveConversation () {
		GameCore.ToggleControls( true );
		
		MouseLook.SetActive ( true );
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
		
		} else if ( type == "promptzzz" ) { // DISABLE TEMPORARILY
			title = line_array[current_line][1];
			text = line_array[current_line][2];
			cancel = line_array[current_line][3];
		
			HUD.prompt_current_title = title;
			HUD.prompt_current_instructions = text;
			HUD.prompt_current_cancel = ( cancel == "true" );
			HUD.prompt_current_convo = this;
			
			HUD.OpenPrompt();
		
		} else if ( type == "group" ) {
			
			UIConversation.SetName ( GameCore.playerName );
						
			for ( var i = 1; i < line_array[current_line].Count; i++ ) {
				text = line_array[current_line][i];
				if ( text.Replace( "(player)", GameCore.playerName ) ) {
					text = text.Replace( "(player)", GameCore.playerName );
				}
	
				UIConversation.SetOption ( i-1, text.Split("|"[0])[0] );
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
			FlagManager.SetFlag ( attr );
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
			xml_data.Load("Assets/Resources/Conversations/" + chapter.ToString() + "/" + scene.ToString() + "/" + actorName + ".xml");
	
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
								FlagManager.SetFlag ( convo.Attributes["setflag"].Value );
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
							FlagManager.SetFlag ( convo.Attributes["setflag"].Value );
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
				} else if ( Input.GetKeyDown(KeyCode.S) && current_option < 2 ) {
					current_option++;
					UIConversation.HighlightLine ( current_option );
					
				} else if ( Input.GetKeyDown(KeyCode.W) && current_option > 0 ) {
					current_option--;
					UIConversation.HighlightLine ( current_option );
				
				}
			} else {
				if ( Input.GetKeyDown(KeyCode.F) ) {
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