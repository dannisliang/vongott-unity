#pragma strict

@script AddComponentMenu ("OpenGUI/Label")

class OGLabel extends OGWidget {
	var autoHeight : boolean = false;
	var text : String;
	
	public function CalcHeight () {
		var height : float = guiStyle.CalcHeight ( GUIContent ( text ), transform.localScale.x );
		transform.localScale = new Vector3 ( transform.localScale.x, height, 1 );
	}
	
	override function Draw ( x : float, y : float ) {		
		if ( !guiStyle ) { guiStyle = GUI.skin.label; }
		
		if ( autoHeight ) {
			CalcHeight ();
		}
		
		GUI.Label ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, guiStyle );
	}
}