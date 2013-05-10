#pragma strict

@script ExecuteInEditMode

class OGLabel extends OGWidget {
	var text : String;
	
	override function Draw ( x : float, y : float ) {		
		if ( !guiStyle ) {
			return;
		}
		
		GUI.Label ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, guiStyle );
	}
}