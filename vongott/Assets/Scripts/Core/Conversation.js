// Imports
import System.Xml;

// Game objects
var hud : HUD;
var core : GameCore;

// Variables
private var in_convo = false; 
var id : String;
var line_array = new Array();
var current_line = 0;

function LeaveConversation () {
	hud.exit_convo = true;
	in_convo = false;
	current_line = 0;
	line_array = [];
}

function NextLine () {
	var type = line_array[current_line][0];
	var name : String;
	var text : String;
	var id : String;
	var flag : String;
	var option1 : String;
	var option2 : String;
	var option3 : String;
	
	if ( type == "line" ) {
		name = line_array[current_line][1];
		text = line_array[current_line][2];
		
		hud.convo_current_name = name;
		hud.convo_current_line = text;
	
	} else if ( type == "machinima" ) {
		id = line_array[current_line][1];
	
		hud.convo_current_name = type;
		hud.convo_current_line = id;
	
	} else if ( type == "prompt" ) {
		id = line_array[current_line][1];
	
		hud.convo_current_name = type;
		hud.convo_current_line = id;
	
	} else if ( type == "group" ) {
		hud.convo_current_name = "(player)";
		hud.convo_current_line = "";
		
		for ( var i = 1; line_array[current_line].Count; i++ ) {
			hud.convo_current_option1 = line_array[current_line][i];
		}
	}
		
	hud.update_convo = true;
	
	if ( current_line < line_array.length - 1 ) {
		current_line++;
	} else {
		LeaveConversation();
	}
}

function EnterConversation () {
	if (!in_convo) {
		hud.start_convo = true;
		in_convo = true;
		var current_convo = 0;
				
		var xml_data = new XmlDocument();
		xml_data.Load("Assets/Resources/Conversations/" + id + ".xml");

		var node_list : XmlNodeList;
		var root : XmlNode = xml_data.DocumentElement;

	    node_list = root.SelectNodes("/scene/convo");
			
		for ( var i=0; i<node_list.Count; i++) {
			if ( node_list[i].Attributes["flag"] ) {
				if ( core.GetFlag ( node_list[i].Attributes["flag"].Value ) ) {
					current_convo = i;
					break;
				}
								
			} else {
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
		}
		
		for ( var x=0; x<node_list[current_convo].ChildNodes.Count; x++) {
        	var type = node_list[i].ChildNodes[x].Name;
        	var name : String;
			var text : String;
			var id : String;
			var flag : String;
        	var option1 : String;
        	var option2 : String;
        	var option3 : String;
        	
        	if ( type == "line" ) {
        		name = node_list[i].ChildNodes[x].Attributes["name"].Value;
        		text = node_list[i].ChildNodes[x].InnerText;
       			
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
        		id = node_list[i].ChildNodes[x].Attributes["id"].Value;
        		line_array[x] = [type,id];
        	
        	} else if ( type == "group" ) {
        		line_array[x] = [type];
        			        		
        		for ( var v = 0; v < node_list[i].ChildNodes[x].ChildNodes.Count; v++ ) {
        			line_array.push ( node_list[i].ChildNodes[x].ChildNodes[v].InnerText );
        		}
        	}
		}
	   
	    NextLine();
	}
}

function Start () {

}

function Update () {
	if ( in_convo ) {
		if ( Input.GetKeyDown(KeyCode.Escape) ) {
			LeaveConversation();
		} else if ( Input.GetKeyDown(KeyCode.F) ) {
			NextLine();
		}
	}
}