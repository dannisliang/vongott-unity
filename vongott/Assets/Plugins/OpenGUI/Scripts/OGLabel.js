#pragma strict

@script ExecuteInEditMode

class OGLabel extends OGWidget {
	var text : String;
	
	var style : GUIStyle;
	
	override function Draw ( x : float, y : float ) {	
		GUI.depth = depth;
		
		GUI.Label ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, style );
	}
}