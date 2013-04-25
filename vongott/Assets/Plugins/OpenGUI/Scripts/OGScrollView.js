#pragma strict

class OGScrollView extends OGWidget {
	var position : Vector2 = Vector2.zero;
	var widgets : List.<OGWidget> = new List.<OGWidget>();
	var area : float = 0;

	var alwaysShowVertical = false;
	var alwaysShowHorizontal = false;
	
	// Constructor
	function OGScrollView () {
		
	}
	
	// Add widgets
	function Add ( w : OGWidget ) {
		widgets.Add ( w );
	}
	
	// Draw
	override function Draw () {
		if ( !enabled ) {
			return;
		}
		
		position = GUI.BeginScrollView (
			Rect ( x, y, width, height ),
			position,
			Rect ( 8, -8, width - 16, area ),
			alwaysShowHorizontal,
			alwaysShowVertical
		);
		
		for ( var w : OGWidget in widgets ) {
			w.Draw ();
		}
	
		GUI.EndScrollView();
	
		if ( area == 0 && widgets.Count > 0 ) {
			var first = widgets[0];
			var last = widgets[widgets.Count - 1];
									
			area = first.y + first.height + last.y + last.height;
		}
	}
}