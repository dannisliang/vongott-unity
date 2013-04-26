#pragma strict

@script ExecuteInEditMode

class OGLabel extends OGWidget {
	var text : String;
	var font : Font;
	var style : FontStyle;
	var size : int  = 12;
	var alignment : TextAnchor;
	var color : Color = Color.white;
	
	@HideInInspector var guiStyle : GUIStyle;	
		
	function Start () {
		guiStyle = new GUIStyle();
	}
	
	override function UpdateWidget () {
		guiStyle.font = font;
		guiStyle.alignment = alignment;
		guiStyle.fontStyle = style;
		guiStyle.normal.textColor = color;
		guiStyle.fontSize = size;
	}
	
	override function Draw ( x : float, y : float ) {	
		GUI.Label ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), text, guiStyle );
	}
}