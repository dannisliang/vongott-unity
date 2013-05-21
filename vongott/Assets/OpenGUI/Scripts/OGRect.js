#pragma strict

class OGRect extends OGWidget {
	override function Draw ( x : float, y : float ) {	
		if ( !guiStyle ) { guiStyle = GUI.skin.box; }
			
		guiRect = Rect ( x, y, transform.localScale.x, transform.localScale.y );
		
		GUI.Box ( guiRect, "", guiStyle );
	}
}