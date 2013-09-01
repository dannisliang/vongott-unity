#pragma strict

@script AddComponentMenu ("OpenGUI/Button")

class OGButton extends OGWidget {
	var text : String;
	var target : GameObject;
	var message : String;
	var argument : String;
	var func : Function;

	override function Draw ( x : float, y : float ) {		
		if ( !guiStyle ) { guiStyle = GUI.skin.button; }
		
		if ( GUI.Button ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, guiStyle ) ) {
			if ( func ) {
				func ();			
			} else if ( argument && target ) {
				target.SendMessage ( message, argument );
			} else if ( target ) {
				target.SendMessage ( message, this );
			}
		}
	}
}