#pragma strict

class OGButton extends OGWidget {
	var text : String;
	var target : GameObject;
	var message : String;
	var argument : String;

	var style : GUIStyle;

	override function Draw ( x : float, y : float ) {		
		GUI.depth = depth;
		
		if ( GUI.Button ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text ) ) {
			target.SendMessage ( message, argument );
		}
	}
}