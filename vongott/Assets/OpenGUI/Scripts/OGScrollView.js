#pragma strict

class OGScrollView extends OGWidget {
	var scrollLength : float;
	var viewWidth : float = 100;
	var viewHeight : float = 100;
	var alwaysVertical = false;
	var alwaysHorizontal = false;
	var inset : float = 10;
	var position : Vector2 = Vector2.zero;
		
	// Update
	override function UpdateWidget () {		
		for ( var w : OGWidget in transform.GetComponentsInChildren (OGWidget) ) {			
			if ( w != this ) {
				// Make sure the widgets aren't drawn automatically
				if ( !w.manualDraw ) {
					w.manualDraw = true;
				}
			
				// Update the scroll length
				if ( scrollLength < inset + w.gameObject.transform.localPosition.y + w.gameObject.transform.localScale.y + inset ) {
					scrollLength = inset + w.gameObject.transform.localPosition.y + w.gameObject.transform.localScale.y + inset;
				}
			}
		}
	}
	
	// Draw
	override function Draw ( x : float, y : float ) {
		// Start scroll view
		position = GUI.BeginScrollView (
			Rect ( x, y, viewWidth, viewHeight ),
			position,
			Rect ( -inset, -inset, viewWidth - ( inset * 2 ), scrollLength ),
			alwaysHorizontal,
			alwaysVertical
		);
		
		// Queue up widgets for drawing
		var queue : List.< List.< OGWidget > > = new List.< List.< OGWidget > >();
		
		// ^ create 30 batches
		for ( var k = 0; k < 30; k++ ) {
			queue.Add ( new List.< OGWidget >() );
		}
		
		// ^ put widgets into their batches
		for ( var w : OGWidget in transform.GetComponentsInChildren (OGWidget) ) {
			if ( w != this ) {
				// Queue index is based on the Z position
				var index : int = w.transform.localPosition.z;
				var count : int = queue.Count;
				
				// Make sure the index is between 0 and the amount of batches in the queue
				if ( index > 0 ) { index = 0; }
				else { index = Mathf.Abs( index ); }																																																										
				if ( index >= count ) { index = count - 1; }
				
				// Add the widget to the batch
				queue[index].Add ( w );
			}
		}
	
		// Draw widgets
		for ( var i = 0; i < queue.Count; i++ ) {
			for ( var item : OGWidget in queue[i] ) {
				item.Draw ( item.transform.position.x - transform.position.x, item.transform.position.y - transform.position.y );
			}
		}
	
		// End scroll view
		GUI.EndScrollView();

	}
}