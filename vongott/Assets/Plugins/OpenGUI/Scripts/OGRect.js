#pragma strict

@script ExecuteInEditMode

class OGRect extends OGWidget {
	override function Draw ( x : float, y : float ) {
		GUI.depth = depth;
		
		GUI.Box ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), "" );
	}
}