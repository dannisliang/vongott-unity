#pragma strict

class OGLabel extends OGWidget {
	var text : String = "";
	var style : GUIStyle;
	
	function OGLabel ( str : String ) {
		text = str;
	
		style = new GUIStyle ();
		style.normal.textColor = Color.white;
		style.fontSize = 12;
	}
		
	override function Draw () {
		if ( !enabled ) {
			return;
		}
		
		if ( width == null ) {
			width = text.Length * style.fontSize;
		}
	
		if ( height == null ) {
			height = style.fontSize;
		}
	
		GUI.Label ( Rect ( x, y, width, height ), text, style );
	}
}