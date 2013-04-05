import System.Xml;

class Conversation extends InteractiveObject {	
	var id : String;
	
	private var line_array = new Array();
	private var current_line = 0;
	private var in_convo = false; 
	private var skip_line = false;
	
	// LEAVE CONVO
	function LeaveConversation () {
		GameCore.ToggleControls( true );
	
		HUD.LeaveConversation();
		in_convo = false;
		current_line = 0;
		line_array = [];
	}
	
	// NEXT LINE
	function NextLine () {
		// check if there are more lines to read
		if ( current_line >= line_array.Count ) {
			LeaveConversation();
			return;
		}
		
		var type = line_array[current_line][0];
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
				if ( GameCore.GetFlag( line_array[current_line][3] ) == false ) {
					skip_line = true;
					return;			
				}
			}
			
			name = line_array[current_line][1];
			text = line_array[current_line][2];
			
			if ( name == "(player)" ) {
				name = GameCore.player_name;
			}
			
			if ( text.Replace( "(player)", GameCore.player_name ) ) {
				text = text.Replace( "(player)", GameCore.player_name );
			}
			
			HUD.ResetConversation();
			
			HUD.conversation.name.text = name;
			HUD.conversation.line.text = text;
			
			HUD.UpdateConversation();
		
		} else if ( type == "machinima" ) {
			id = line_array[current_line][1];
		
			HUD.ResetConversation();
		
			HUD.conversation.name.text = type;
			HUD.conversation.line.text = id;
			
			HUD.UpdateConversation();
		
		} else if ( type == "prompt" ) {
			title = line_array[current_line][1];
			text = line_array[current_line][2];
			cancel = line_array[current_line][3];
		
			HUD.prompt_current_title = title;
			HUD.prompt_current_instructions = text;
			HUD.prompt_current_cancel = ( cancel == "true" );
			HUD.prompt_current_convo = this;
			
			HUD.OpenPrompt();
		
		} else if ( type == "group" ) {
			HUD.ResetConversation();
			
			HUD.conversation.name.text = GameCore.player_name;
			HUD.conversation.line.text = "";
			
			for ( var i = 1; i < line_array[current_line].Count; i++ ) {
				text = line_array[current_line][i];
				if ( text.Replace( "(player)", GameCore.player_name ) ) {
					text = text.Replace( "(player)", GameCore.player_name );
				}
	
				HUD.convo_current_options[i-1] = text.Split("|"[0])[0];
			}
			
			HUD.UpdateConversation();
		}
		
		// go to next line
		current_line++;
	}
	
	// CHOOSE LINE
	function ChooseLine () {
		var attr = line_array[current_line-1][1 + HUD.convo_current_highlight].ToString().Split("|"[0])[1]; 
		
		HUD.convo_current_options[0] = "";
		HUD.convo_current_options[1] = "";
		HUD.convo_current_options[2] = "";
		
		if ( attr == "cancel" ) {
			LeaveConversation();
		} else if ( attr == "" ) {
			NextLine();
		} else {
			GameCore.SetFlag ( attr );
			NextLine();
		}
	}
	
	// ENTER CONVO
	function EnterConversation () {
		if (!in_convo) {
			GameCore.ToggleControls( false );
		
		   	// send start message to HUD
			HUD.EnterConversation();
			in_convo = true;
			var current_convo = 0;
			
			// read XML document
			var xml_data = new XmlDocument();
			xml_data.Load("Assets/Resources/Conversations/" + id + ".xml");
	
			// define XML root
			var node_list : XmlNodeList;
			var root : XmlNode = xml_data.DocumentElement;
		    node_list = root.SelectNodes("/scene/convo");
				
			// loop through convo tags and determine which one to display
			var convo_counter = 0;
			for ( var convo in node_list ) {	
				// if there is a flag and it's true, use this convo
				if ( convo.Attributes["flag"] ) {
					if ( GameCore.GetFlag ( convo.Attributes["flag"].Value ) ) {
						// if there is a startquest attribute, start it
						if ( convo.Attributes["startquest"] ) {
							GameCore.StartQuest ( convo.Attributes["startquest"].Value );
						}
						
						// if there is a setflag attribute, set it
						if ( convo.Attributes["setflag"] ) {
							if ( !GameCore.GetFlag ( convo.Attributes["setflag"].Value ) ) {
								GameCore.SetFlag ( convo.Attributes["setflag"].Value );
								current_convo = convo_counter;
								break;
							}
						} else {
							current_convo = convo_counter;
							break;
						}
					}
				
				} else {
				
					// if there is a setflag attribute and it's not been set already, set it and use this convo
					if ( convo.Attributes["setflag"] ) {
						if ( !GameCore.GetFlag ( convo.Attributes["setflag"].Value ) ) {
							GameCore.SetFlag ( convo.Attributes["setflag"].Value );
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
		   	HUD.UpdateConversation();
		}
	}
	
	// INIT
	function Start () {
	
	}
	
	// UPDATE
	function Update () {
		if ( in_convo ) {
			// Check if line should be skipped
			if ( skip_line ) {
				skip_line = false;
				current_line++;
				NextLine();
			}
			
			// Use action key to proceed through convos
			if ( Input.GetKeyDown(KeyCode.F) ) {
				if ( HUD.convo_current_options[0] != "" ) {
					ChooseLine();
				} else if ( HUD.prompt_current_title == "" ) {
					NextLine();
				}
			}
			
		// Interact
		} else if ( HUD.showing && GameCore.GetInteractiveObject() == this.gameObject ) {
			if ( !HUD.notification.active ) {
				HUD.ShowNotification ( "Talk [F]" );
			}
			
			if ( Input.GetKeyDown(KeyCode.F) ) {
				EnterConversation();
			}
		}
	}
}