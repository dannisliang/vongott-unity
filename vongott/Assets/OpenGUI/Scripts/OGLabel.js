#pragma strict

@script AddComponentMenu ("OpenGUI/Label")

class OGLabel extends OGWidget {
	var autoResize : boolean = false;
	var text : String;
	
	override function Draw ( x : float, y : float ) {		
		if ( !guiStyle ) { guiStyle = GUI.skin.label; }
		
		if ( autoResize ) {
			var size : Vector2 = guiStyle.CalcSize ( GUIContent ( text ) );
			transform.localScale = new Vector3 ( size.x, size.y, 1 );
		}
		
		GUI.Label ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, guiStyle );
	}
}