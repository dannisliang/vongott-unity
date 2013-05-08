#pragma strict

@script ExecuteInEditMode

class OGRect extends OGWidget {
	override function Draw ( x : float, y : float ) {
		guiRect = Rect ( x, y, transform.localScale.x, transform.localScale.y );
		
		GUI.Box ( guiRect, "" );
	}
}