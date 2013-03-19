import System.Xml;

var hud : HUD;
var core : GameCore;

private var in_convo = false; 
var id : String;
var line_array = new Array();
var current_line = 0;

// LEAVE CONVO
function LeaveConversation () {
	hud.exit_convo = true;
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
		name = line_array[current_line][1];
		text = line_array[current_line][2];
		
		if ( name == "(player)" ) {
			name = GameCore.player_name;
		}
		
		if ( text.Replace( "(player)", GameCore.player_name ) ) {
			text = text.Replace( "(player)", GameCore.player_name );
		}
		
		hud.convo_current_name = name;
		hud.convo_current_line = text;
		
		hud.update_convo = true;
	
	} else if ( type == "machinima" ) {
		id = line_array[current_line][1];
	
		hud.convo_current_name = type;
		hud.convo_current_line = id;
		
		hud.update_convo = true;
	
	} else if ( type == "prompt" ) {
		title = line_array[current_line][1];
		text = line_array[current_line][2];
		cancel = line_array[current_line][3];
	
		hud.prompt_current_title = title;
		hud.prompt_current_instructions = text;
		hud.prompt_current_cancel = ( cancel == "true" );
		hud.prompt_current_convo = this;
		
		hud.open_prompt = true;
	
	} else if ( type == "group" ) {
		hud.convo_current_name = "(player)";
		hud.convo_current_line = "";
		
		for ( var i = 1; line_array[current_line].Count; i++ ) {
			hud.convo_current_option1 = line_array[current_line][i];
		}
		
		hud.update_convo = true;
	}
	
	// go to next line
	current_line++;
}

// ENTER CONVO
function EnterConversation () {
	if (!in_convo) {
		// send start message to HUD
		hud.start_convo = true;
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
		for ( var i=0; i<node_list.Count; i++) {
			
			// if there is a flag and it's true, use this convo
			if ( node_list[i].Attributes["flag"] ) {
				if ( core.GetFlag ( node_list[i].Attributes["flag"].Value ) ) {
					// if there is a setflag attribute, set it
					if ( node_list[i].Attributes["setflag"] ) {
						if ( !core.GetFlag ( node_list[i].Attributes["setflag"].Value ) ) {
							core.SetFlag ( node_list[i].Attributes["setflag"].Value );
							current_convo = i;
							break;
						}
					} else {
						current_convo = i;
						break;
					}
				}
			
			} else {
			
				// if there is a setflag attribute and it's not been set already, set it and use this convo
				if ( node_list[i].Attributes["setflag"] ) {
					if ( !core.GetFlag ( node_list[i].Attributes["setflag"].Value ) ) {
						core.SetFlag ( node_list[i].Attributes["setflag"].Value );
						current_convo = i;
						break;
					}
					
				// if there are no flags involved, use this convo
				} else {
					current_convo = i;
					break;
					
				}			
			}
		}
		
		// loop through lines for selected convo
		for ( var x=0; x<node_list[current_convo].ChildNodes.Count; x++) {
        	var type = node_list[i].ChildNodes[x].Name;
        	var name : String;
			var text : String;
			var id : String;
			var flag : String;
        	var option1 : String;
        	var option2 : String;
        	var option3 : String;
        	
        	// check for line types and insert them into the line array
        	if ( type == "line" ) {
        		name = node_list[i].ChildNodes[x].Attributes["name"].Value;
        		text = node_list[i].ChildNodes[x].InnerText;
       			
       			// set flag if any
       			if ( node_list[i].ChildNodes[x].Attributes["flag"] ) {
       				flag = node_list[i].ChildNodes[x].Attributes["flag"].Value;
        		} else {
        			flag = "";
        		}
        		
        		line_array[x] = [type,name,text,flag];
        	
        	} else if ( type == "machinima" ) {
        		id = node_list[i].ChildNodes[x].Attributes["id"].Value;
        		line_array[x] = [type,id];
        	
        	} else if ( type == "prompt" ) {
        		name = node_list[i].ChildNodes[x].Attributes["title"].Value;
        		text = node_list[i].ChildNodes[x].Attributes["text"].Value;
        		flag = node_list[i].ChildNodes[x].Attributes["cancel"].Value;
        		line_array[x] = [type,name,text,flag];
        	
        	} else if ( type == "group" ) {
        		line_array[x] = [type];
        			        		
        		for ( var v = 0; v < node_list[i].ChildNodes[x].ChildNodes.Count; v++ ) {
        			line_array.push ( node_list[i].ChildNodes[x].ChildNodes[v].InnerText );
        		}
        	}
		}
	   
	   	// go to next line
		NextLine();
	}
}

// INIT
function Start () {

}

// UPDATE
function Update () {
	if ( in_convo ) {
		// use action key to proceed through convos
		if ( Input.GetKeyDown(KeyCode.F) ) {
			NextLine();
		}
	}
}