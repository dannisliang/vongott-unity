#pragma strict

class OGRect extends OGWidget {
	function OGRect () {}
	
	override function Draw () {
		if ( !enabled ) {
			return;
		}
		
		GUI.Box ( Rect ( x, y, width, height ), "" );
	}
}