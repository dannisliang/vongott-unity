#pragma strict

@script ExecuteInEditMode

class OGWidget extends MonoBehaviour {
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
	
	private class Pivot {
		var x : RelativeX;
		var y : RelativeY;
	}
	
	private class Anchor {		
		var x : RelativeX = RelativeX.None;
		var xOffset : float = 0.0;
		
		var y : RelativeY = RelativeY.None;
		var yOffset : float = 0.0;
	}
	
	var style : String = "";
	var pivot : Pivot;
	var anchor : Anchor;	
	var stretch : Stretch;
	
	@HideInInspector var adjustPivot : Vector2 = Vector2.zero;				
	@HideInInspector var manualDraw = false;
	@HideInInspector var mouseOver = false;
	@HideInInspector var guiRect : Rect;
	@HideInInspector var guiStyle : GUIStyle;
	
	function SetX ( x : float ) {
		transform.localPosition = new Vector3 ( x, transform.localPosition.y, transform.localPosition.z );
	}
	
	function SetY ( y : float ) {
		transform.localPosition = new Vector3 ( transform.localPosition.x, y, transform.localPosition.z );
	}
	
	function SetWidth ( w : float ) {
		transform.localScale = new Vector3 ( w, transform.localScale.y, 1.0 );
	}
	
	function SetHeight ( h : float ) {
		transform.localScale = new Vector3 ( transform.localScale.x, h, 1.0 );
	}
	
	function CheckStyle ( skin : GUISkin ) : GUIStyle {
		if ( skin.FindStyle ( style ) && style != "" ) {
			return skin.FindStyle ( style );
		} else {
			return null;
		}
	}
	
	// Apply stretch
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
		
		if ( stretch.width != ScreenSize.None ) { SetWidth ( modify_width ); }
		if ( stretch.height != ScreenSize.None ) { SetHeight ( modify_height ); }
	}
	
	// Apply the anchor position
	function ApplyAnchor () {
		var anchor_x = 0;
		var anchor_y = 0;
		
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

		if ( anchor.x != RelativeX.None ) { SetX ( anchor_x + anchor.xOffset ); }
		if ( anchor.y != RelativeY.None ) { SetY ( anchor_y + anchor.yOffset ); }
	}
	
	// Apply the pivot point
	function ApplyPivot () {		
		if ( pivot.x == RelativeX.Center ) {
			adjustPivot.x = -(transform.localScale.x / 2);
		} else if ( pivot.x == RelativeX.Right ) {
			adjustPivot.x = -transform.localScale.x;
		} else {
			adjustPivot.x = 0;
		}
		
		if ( pivot.y == RelativeY.Center ) {
			adjustPivot.y = -(transform.localScale.y / 2);
		} else if ( pivot.y == RelativeY.Bottom ) {
			adjustPivot.y = -transform.localScale.y;
		} else {
			adjustPivot.y = 0;
		}
	}
	
	function UpdateWidget () {}
	
	function Draw ( x : float, y : float ) {}
	
	function CancelZScale () {
		if ( transform.localScale.z != 1 ) {
			transform.localScale = new Vector3 ( transform.localScale.x, transform.localScale.y, 1 );
		}
	}
	
	function Start () {}
	
	function OnGUI () {
		GUI.depth = transform.localPosition.z;
		
		if ( OGRoot.skin ) {
			GUI.skin = OGRoot.skin;
			guiStyle = CheckStyle ( OGRoot.skin );
		}
		
		if ( !manualDraw ) {
			Draw ( transform.position.x + adjustPivot.x, transform.position.y + adjustPivot.y );
		}
		
		mouseOver = guiRect.Contains ( Event.current.mousePosition );
	}
	
	function Update () {		
		ApplyStretch ();
		ApplyAnchor ();
		ApplyPivot ();
		
		UpdateWidget();
		CancelZScale ();
	}
}