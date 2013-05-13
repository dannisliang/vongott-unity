#pragma strict

@script ExecuteInEditMode;

class OGPopUp extends OGWidget {	
	var title : String;
	var isUp = false;
	var options : String[];
	var message : String;
	var messageTarget : GameObject;
	var padding : Vector2 = new Vector2 ( 8.0, 8.0 );
	
	@HideInInspector var selectedOption : String;
	@HideInInspector var originalZ : float = 99;
				
	// Draw
	override function Draw ( x : float, y : float ) {	
		if ( !isUp ) {			
			var label : String;
			
			if ( selectedOption ) {
				label = selectedOption;
			} else {
				label = title;
			}
			
			guiRect = Rect ( x, y, transform.localScale.x + (padding.x * 2), guiStyle.fontSize + padding.y );
			GUI.Box ( guiRect, "" );
			
			if ( GUI.Button ( Rect ( x, y, transform.localScale.x + (padding.x * 2), transform.localScale.y ), label, guiStyle ) ) {
				isUp = true;
			}
		} else {			
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
		if ( originalZ == 99 ) {
			originalZ = transform.localPosition.z;
		}
		
		if ( isUp ) {
			transform.localPosition.z = -10;
		} else {
			transform.localPosition.z = originalZ;
		}
		
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			isUp = false;
		}
	}
}