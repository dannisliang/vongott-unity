#pragma strict

class OGButton extends OGWidget {
	var text : String;
	var target : GameObject;
	var message : String;
	var argument : String;

	override function Draw ( x : float, y : float ) {		
		if ( !guiStyle ) {
			return;
		}
		
		if ( GUI.Button ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, guiStyle ) ) {
			if ( argument ) {
				target.SendMessage ( message, argument );
			} else {
				target.SendMessage ( message, this );
			}
		}
	}
}