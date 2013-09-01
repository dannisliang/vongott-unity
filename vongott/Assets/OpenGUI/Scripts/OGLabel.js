#pragma strict

@script AddComponentMenu ("OpenGUI/Label")

class OGLabel extends OGWidget {
	var text : String;
	
	override function Draw ( x : float, y : float ) {		
		if ( !guiStyle ) { guiStyle = GUI.skin.label; }
		
		GUI.Label ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, guiStyle );
	}
}