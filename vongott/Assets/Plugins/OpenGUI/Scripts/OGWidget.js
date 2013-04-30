#pragma strict

@script ExecuteInEditMode

enum RelativeX {
	None,
	Left,
	Center,
	Right
}

enum RelativeY {
	None,
	Top,
	Center,
	Bottom
}

enum ScreenSize {
	None,
	ScreenWidth,
	ScreenHeight
}

public class TextProperties {
	var font : Font;
	var style : FontStyle;
	var size : int = 12;
	var alignment : TextAnchor;
	var normal : Color = Color.white;
	var hover : Color = Color.white;
	var active : Color = Color.white;	

	@HideInInspector var guiStyle : GUIStyle;
	
	function Init () {
		guiStyle = new GUIStyle ();
		guiStyle.font = font;
		guiStyle.fontStyle = style;
		guiStyle.fontSize = size;
		guiStyle.alignment = alignment;
		guiStyle.normal.textColor = normal;
		guiStyle.hover.textColor = hover;
		guiStyle.active.textColor = active;
	}
}

public class ButtonProperties extends TextProperties {
	var normalBg : Color = Color.black;
	var hoverBg : Color = Color.black;
	var activeBg : Color = Color.black;
	var padding : Vector2 = Vector2.zero;
	
	@HideInInspector var bg1 : Texture2D;
	@HideInInspector var bg2 : Texture2D;
	@HideInInspector var bg3 : Texture2D;
	
	override function Init () {
		bg1 = new Texture2D(2,2);
		bg1.SetPixels([normalBg,normalBg,normalBg,normalBg]);
		bg1.Apply();
	
		bg2 = new Texture2D(2,2);
		bg2.SetPixels([hoverBg,hoverBg,hoverBg,hoverBg]);
		bg2.Apply();
		
		bg3 = new Texture2D(2,2);
		bg3.SetPixels([activeBg,activeBg,activeBg,activeBg]);
		bg3.Apply();
	
		guiStyle = new GUIStyle ();
		guiStyle.font = font;
		guiStyle.fontStyle = style;
		guiStyle.fontSize = size;
		guiStyle.alignment = alignment;
		guiStyle.normal.textColor = normal;
		guiStyle.hover.textColor = hover;
		guiStyle.active.textColor = active;
		guiStyle.normal.background = bg1;
		guiStyle.hover.background = bg2;
		guiStyle.active.background = bg3;
		guiStyle.padding.top = padding.y;
		guiStyle.padding.bottom = padding.y;
		guiStyle.padding.left = padding.x;
		guiStyle.padding.right = padding.x;
	}
}

private class Stretch {
	var width : ScreenSize = ScreenSize.None;
	var widthFactor : float = 1.0;
	var widthOffset : float = 0.0;
	
	var height : ScreenSize = ScreenSize.None;
	var heightFactor : float = 1.0;
	var heightOffset : float = 0.0;
}

private class Anchor {
	var object : GameObject;
	
	var x : RelativeX = RelativeX.None;
	var xOffset : float = 0.0;
	
	var y : RelativeY = RelativeY.None;
	var yOffset : float = 0.0;
}

class OGWidget extends MonoBehaviour {	
	var depth : int = 0;
	var drawLocalPosition = false;
	var manualDraw = false;
	var anchor : Anchor;	
	var stretch : Stretch;
	
	@HideInInspector var guiRect : Rect;
	
	function SetX ( x : float ) {
		transform.localPosition = new Vector3 ( x, transform.localPosition.y, 0.0 );
	}
	
	function SetY ( y : float ) {
		transform.localPosition = new Vector3 ( transform.localPosition.x, y, 0.0 );
	}
	
	function SetWidth ( w : float ) {
		transform.localScale = new Vector3 ( w, transform.localScale.y, 1.0 );
	}
	
	function SetHeight ( h : float ) {
		transform.localScale = new Vector3 ( transform.localScale.x, h, 1.0 );
	}
	
	function ApplyStretch () {
		var modify_width = transform.localScale.x;
		var modify_height = transform.localScale.y;
		
		if ( stretch.width == ScreenSize.ScreenWidth ) {
			modify_width = ( Screen.width * stretch.widthFactor ) + stretch.widthOffset;
		} else if ( stretch.width == ScreenSize.ScreenHeight ) {
			modify_width = ( Screen.height * stretch.widthFactor ) + stretch.widthOffset;
		}
		
		if ( stretch.height == ScreenSize.ScreenWidth ) {
			modify_height = ( Screen.width * stretch.heightFactor ) + stretch.heightOffset;
		} else if ( stretch.height == ScreenSize.ScreenHeight ) {
			modify_height = ( Screen.height * stretch.heightFactor ) + stretch.heightOffset;
		}
		
		SetWidth ( modify_width );
		SetHeight ( modify_height );
	}
	
	function ApplyPosition () {
		if ( !anchor.object && anchor.x == RelativeX.None && anchor.y == RelativeY.None ) {
			return;
		}
		
		var modify_x = transform.localPosition.x;
		var modify_y = transform.localPosition.y;
		
		var anchor_x = 0;
		var anchor_y = 0;
		
		if ( anchor.object ) {
			anchor_x = anchor.object.transform.localPosition.x;
			anchor_y = anchor.object.transform.localPosition.y;
		
			anchor.x = RelativeX.None;
			anchor.y = RelativeY.None;
		} else {
			if ( anchor.x == RelativeX.Center ) {
				anchor_x = Screen.width / 2;
			} else if ( anchor.x == RelativeX.Right ) {
				anchor_x = Screen.width;
			}
			
			if ( anchor.y == RelativeY.Center ) {
				anchor_y = Screen.height / 2;
			} else if ( anchor.y == RelativeY.Bottom ) {
				anchor_y = Screen.height;
			}
		}
		
		modify_x = anchor_x + anchor.xOffset;
		modify_y = anchor_y + anchor.yOffset;
		
		if ( anchor.object || anchor.x != RelativeX.None ) {
			SetX ( modify_x );
		}
		
		if ( anchor.object || anchor.y != RelativeY.None ) {
			SetY ( modify_y );
		}
	}
	
	function UpdateWidget () {}
	
	function Draw ( x : float, y : float ) {}
	
	function Start () {}
	
	function OnGUI () {
		if ( !manualDraw ) {
			if ( drawLocalPosition ) {
				Draw ( transform.localPosition.x, transform.localPosition.y );
			} else {
				Draw ( transform.position.x, transform.position.y );
			}
		}
		
		if ( guiRect.Contains ( Input.mousePosition ) ) {
			// DETECT MOUSE RAY STUFF AND THING
		}
	}
	
	function Update () {	
		if ( stretch ) {
			ApplyStretch ();
			ApplyPosition ();
		}
		
		UpdateWidget();
	}
}