#pragma strict

class OGGroup extends OGWidget {
	var widgets : List.<OGWidget> = new List.<OGWidget>();
	
	function Add ( w : OGWidget ) {
		widgets.Add ( w );
	}
	
	override function Draw () {
		if ( !enabled ) {
			return;
		}
		
		for ( var w : OGWidget in widgets ) {
			w.Draw ();
		}
	}
	
	override function Update () {
		if ( !enabled ) {
			return;
		}
		
		for ( var w : OGWidget in widgets ) {
			w.Update ();
		}
	}
}