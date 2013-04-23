#pragma strict

class OGButton extends OGWidget {
	var style : GUIStyle;
	var texture : Texture;
	var func : Function;
	var text : String;

	function OGButton ( s : String, f : Function ) {
		text = s;
		func = f;
	}

	override function Draw () {
		if ( !texture ) {
			if ( GUI.Button ( Rect ( x, y, width, height ), text ) ) {
				func ();
			}
		} else {
			if ( GUI.Button ( Rect ( x, y, width, height ), texture ) ) {
				func ();
			}
		}
	}
}