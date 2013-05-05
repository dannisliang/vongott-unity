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
	var depth : int = 0; // MAKE THIS THE Z AXIS
	var drawLocalPosition = false;
	var manualDraw = false;
	var anchor : Anchor;	
	var stretch : Stretch;
	var style : String = "body";
	
	@HideInInspector var guiRect : Rect;
	@HideInInspector var guiStyle : GUIStyle;
	@HideInInspector var emptyStyle : GUIStyle = new GUIStyle();
	
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
	
	function CheckStyle () : GUIStyle {
		if ( !OGRoot.allStyles ) {
			return emptyStyle;
		}
		
		for ( var s : GUIStyle in OGRoot.allStyles ) {
			if ( s.name == style ) {
				return s;
			}
		}
		
		if ( GUI.skin.GetStyle ( style ) ) {	
			return GUI.skin.GetStyle ( style );
		}
		
		return emptyStyle;
	}
	
	function UpdateWidget () {}
	
	function Draw ( x : float, y : float ) {}
	
	function Start () {}
	
	function OnGUI () {
		guiStyle = CheckStyle ();
		
		if ( !manualDraw ) {
			if ( drawLocalPosition ) {
				Draw ( transform.localPosition.x, transform.localPosition.y );
			} else {
				Draw ( transform.position.x, transform.position.y );
			}
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