// Imports
import System.Xml;

// Game objects
var hud : HUD;
var convo_text : UILabel;

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
			
		var xml_data = new XmlDocument();
		xml_data.Load("Assets/Resources/Conversations/" + id + ".xml");

		var node_list : XmlNodeList;
		var root : XmlNode = xml_data.DocumentElement;

	    node_list = root.SelectNodes("/scene/convo");
			
		for ( var i=0; i<node_list.Count; i++) {
	        for ( var x=0; x<node_list[i].ChildNodes.Count; x++) {
	        	var type = node_list[i].ChildNodes[x].Name;
	        	var name : String;
				var text : String;
				var id : String;
	        	
	        	if ( type == "line" ) {
	        		name = node_list[i].ChildNodes[x].Attributes["name"].Value;
	        		text = node_list[i].ChildNodes[x].InnerText;
	       			line_array[x] = [type,name,text];
	        	
	        	} else if ( type == "machinima" ) {
	        		id = node_list[i].ChildNodes[x].Attributes["id"].Value;
	        		line_array[x] = [type,id];
	        	
	        	} else if ( type == "prompt" ) {
	        		id = node_list[i].ChildNodes[x].Attributes["id"].Value;
	        		line_array[x] = [type,id];
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