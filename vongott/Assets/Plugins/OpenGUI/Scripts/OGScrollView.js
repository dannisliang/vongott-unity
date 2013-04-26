#pragma strict

class OGScrollView extends OGWidget {
	var scrollLength : float;
	var viewWidth : float = 100;
	var viewHeight : float = 100;
	var alwaysVertical = false;
	var alwaysHorizontal = false;
	var inset : float = 10;
	var position : Vector2 = Vector2.zero;
	
	// Init
	function Start () {
	
	}
	
	// Update
	override function Update () {
		for ( var i = 0; i < transform.childCount; i++ ) {
			if ( transform.GetChild ( i ).GetComponent( OGWidget ) ) {
				var w : OGWidget = transform.GetChild ( i ).GetComponent( OGWidget );
				
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
		
		for ( var i = 0; i < transform.childCount; i++ ) {
			if ( transform.GetChild ( i ).GetComponent( OGWidget ) ) {
				transform.GetChild ( i ).GetComponent( OGWidget ).Draw( transform.GetChild ( i ).transform.localPosition.x, transform.GetChild ( i ).transform.localPosition.y );
			}
		}
	
		GUI.EndScrollView();

	}
}