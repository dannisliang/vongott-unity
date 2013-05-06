#pragma strict

import System.Text.RegularExpressions;

class OGTextField extends OGWidget {
	var text : String;
	var maxLength : int = 16;
	var restrictASCII : boolean = false;
	var restrictSpaces : boolean = false;
	var restrictNumbers : boolean = false;

	// Because fuck regex
	function RestrictNumbers ( str : String ) : String {
		var newStr : String;
		var periodCounter : int = 0;
		
		for ( var i = 0; i < str.Length; i++ ) {
			var c : String = str[i].ToString();
			
			// numbers
			if ( c == "0" || c == "1" || c == "2" ||  c == "3" ||  c == "4" ||  c == "5" ||  c == "6" ||  c == "7" ||  c == "8" ||  c == "9" ) {
				newStr += c;
			
			// periods
			} else if ( c == "." && periodCounter == 0 ) { 
				newStr += c;
				periodCounter = 1;
				
			// dashes
			} else if ( c == "-" && i == 0 ) {
				newStr = c;
			
			}
		}
		
		return newStr;
	}

	override function Draw ( x : float, y : float ) {
		GUI.depth = depth;
		
		text = GUI.TextField ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, maxLength, guiStyle );
		
		if ( restrictASCII ) {
			text = Regex.Replace(text, "[^a-zA-Z0-9]", "");
		}
	
		if ( restrictSpaces ) {
			text = Regex.Replace(text, "[ ]", "");
		}
	
		if ( restrictNumbers ) {
			text = RestrictNumbers ( text );
		}
	}
}