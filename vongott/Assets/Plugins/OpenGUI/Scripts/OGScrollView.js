#pragma strict

class OGScrollView extends OGWidget {
	var scrollLength : float;
	var viewWidth : float = 100;
	var viewHeight : float = 100;
	var alwaysVertical = false;
	var alwaysHorizontal = false;
	var inset : float = 10;
	var position : Vector2 = Vector2.zero;
	
	@HideInInspector var widgets : Component[];
	
	// Init
	function Start () {
	
	}
	
	// Update
	override function UpdateWidget () {
		widgets = transform.GetComponentsInChildren (OGWidget);
		
		for ( var w : OGWidget in widgets ) {			
			if ( w != this ) {
				if ( !w.manualDraw ) {
					w.manualDraw = true;
					w.drawLocalPosition = true;
				}
			
				if ( scrollLength < inset + w.gameObject.transform.localPosition.y + w.gameObject.transform.localScale.y + inset ) {
					scrollLength = inset + w.gameObject.transform.localPosition.y + w.gameObject.transform.localScale.y + inset;
				}
			}
		}
	}
	
	// Draw
	override function Draw ( x : float, y : float ) {
		position = GUI.BeginScrollView (
			Rect ( x, y, viewWidth, viewHeight ),
			position,
			Rect ( -inset, -inset, viewWidth - ( inset * 2 ), scrollLength ),
			alwaysHorizontal,
			alwaysVertical
		);
		
		for ( var w : OGWidget in widgets ) {
			if ( w != this ) {
				w.Draw ( w.transform.localPosition.x, w.transform.localPosition.y );
			}
		}
	
		GUI.EndScrollView();

	}
}