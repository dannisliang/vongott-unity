#pragma strict

import System.Text.RegularExpressions;

class OGTextField extends OGWidget {
	var text : String;
	var maxLength : int = 16;
	var restrictASCII : boolean = false;
	var restrictSpaces : boolean = false;
	var restrictNumbers : boolean = false;

	function OGTextField ( s : String ) {
		text = s;
	}

	override function Draw () {
		text = GUI.TextField ( Rect ( x, y, width, height ), text, maxLength );
		
		if ( restrictASCII ) {
			text = Regex.Replace(text, "[^a-zA-Z0-9]", "");
		}
	
		if ( restrictSpaces ) {
			text = Regex.Replace(text, "[ ]", "");
		}
	
		if ( restrictNumbers ) {
			text = Regex.Replace(text, "[^0-9]", "");
		}
	}
}