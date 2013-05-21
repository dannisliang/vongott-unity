#pragma strict

@script ExecuteInEditMode;

class OGPopUp extends OGWidget {	
	var title : String;
	var isUp = false;
	var options : String[];
	var message : String;
	var messageTarget : GameObject;
	var padding : Vector2 = new Vector2 ( 8.0, 8.0 );
	
	var selectedOption : String;
	@HideInInspector var originalZ : float = 99;
				
	// Draw
	override function Draw ( x : float, y : float ) {	
		if ( !guiStyle ) { guiStyle = GUI.skin.box; }
		
		var textStyle : GUIStyle = new GUIStyle();
		textStyle.font = GUI.skin.label.font;
		textStyle.normal.textColor = guiStyle.normal.textColor;
		textStyle.fontSize = guiStyle.fontSize;
		textStyle.alignment = guiStyle.alignment;
								
		if ( !isUp ) {			
			var label : String;
			
			if ( selectedOption ) {
				label = selectedOption;
			} else {
				label = title;
			}
			
			guiRect = Rect ( x, y, transform.localScale.x + (guiStyle.padding.left * 2), transform.localScale.y );
			GUI.Box ( guiRect, "", guiStyle );
			
			if ( GUI.Button ( guiRect, label, textStyle ) ) {
				isUp = true;
			}
		} else {			
			guiRect = Rect ( x, y, transform.localScale.x + (guiStyle.padding.left * 2), ( options.Length * (guiStyle.fontSize + guiStyle.padding.top) ) + ( guiStyle.padding.top * 2 ) );
			GUI.Box ( guiRect, "", guiStyle );
			
			for ( var i = 0; i < options.Length; i++ ) {			
				if ( GUI.Button ( Rect ( x + guiStyle.padding.left, y + guiStyle.padding.top + ( ( guiStyle.fontSize + guiStyle.padding.top ) * i ), transform.localScale.x + ( guiStyle.padding.left * 2 ), guiStyle.fontSize + guiStyle.padding.top ), options[i], textStyle ) ) {
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