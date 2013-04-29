#pragma strict

@script ExecuteInEditMode;

class OGPopUp extends OGWidget {	
	var isUp = false;
	var options : String[];
	var messageTarget : GameObject;
	var padding : Vector2 = new Vector2 ( 8.0, 8.0 );
	
	var style : GUIStyle;
	
	@HideInInspector var selectedOption : String = "(pick)";
		
	// Draw
	override function Draw ( x : float, y : float ) {	
		GUI.depth = depth;
		
		if ( !isUp ) {
			guiRect = Rect ( x, y, transform.localScale.x + (padding.x * 2), style.fontSize + padding.y );
			GUI.Box ( guiRect, "" );
			
			if ( GUI.Button ( Rect ( x, y, transform.localScale.x + (padding.x * 2), transform.localScale.y ), selectedOption, style ) ) {
				isUp = true;
				depth = -5;
			}
		} else {
			guiRect = Rect ( x, y, transform.localScale.x + (padding.x * 2), ( options.Length * (style.fontSize + padding.y) ) + ( padding.y * 2 ) );
			GUI.Box ( guiRect, "" );
			
			for ( var i = 0; i < options.Length; i++ ) {			
				if ( GUI.Button ( Rect ( x, y + padding.y + ( ( style.fontSize + padding.y ) * i ), transform.localScale.x + ( padding.x * 2 ), style.fontSize + padding.y ), options[i], style ) ) {
					selectedOption = options[i];
					isUp = false;
					depth = 0;
				}
			}
		}
	}
	
	// Update
	override function UpdateWidget () {		
		if ( selectedOption == "(pick an option)" && options.Length > 0 ) {
			selectedOption = options[0];
		}
		
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			isUp = false;
		}
	}
}