#pragma strict

@script ExecuteInEditMode;

class OGPopUp extends OGWidget {	
	var isUp = false;
	var options : String[];
	var message : String;
	var messageTarget : GameObject;
	var padding : Vector2 = new Vector2 ( 8.0, 8.0 );
	
	@HideInInspector var selectedOption : String = "(pick)";
	@HideInInspector var popDepth : int = 0;
			
	// Draw
	override function Draw ( x : float, y : float ) {	
		GUI.depth = popDepth;
		
		if ( !isUp ) {
			popDepth = depth;
			guiRect = Rect ( x, y, transform.localScale.x + (padding.x * 2), guiStyle.fontSize + padding.y );
			GUI.Box ( guiRect, "" );
			
			if ( GUI.Button ( Rect ( x, y, transform.localScale.x + (padding.x * 2), transform.localScale.y ), selectedOption, guiStyle ) ) {
				isUp = true;
			}
		} else {
			popDepth = depth - 10;
			guiRect = Rect ( x, y, transform.localScale.x + (padding.x * 2), ( options.Length * (guiStyle.fontSize + padding.y) ) + ( padding.y * 2 ) );
			GUI.Box ( guiRect, "" );
			
			for ( var i = 0; i < options.Length; i++ ) {			
				if ( GUI.Button ( Rect ( x, y + padding.y + ( ( guiStyle.fontSize + padding.y ) * i ), transform.localScale.x + ( padding.x * 2 ), guiStyle.fontSize + padding.y ), options[i], guiStyle ) ) {
					selectedOption = options[i];
					isUp = false;
					
					if ( messageTarget && message ) {
						messageTarget.SendMessage ( message );
					}
				}
			}
		}
	}
	
	// Update
	override function UpdateWidget () {		
		if ( selectedOption == "(pick)" && options.Length > 0 ) {
			selectedOption = options[0];
		}
		
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			isUp = false;
		}
	}
}