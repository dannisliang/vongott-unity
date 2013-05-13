#pragma strict

class OGTickBox extends OGWidget {
	var label : String;
	var isChecked : boolean;
	
	override function Draw ( x : float, y : float ) {
		if ( !guiStyle ) {
			return;
		}
		
		isChecked = GUI.Toggle ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), isChecked, label, guiStyle );
	}
}