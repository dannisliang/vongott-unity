#pragma strict

enum RelativePos {
	TopLeft,
	Top,
	TopRight,
	Right,
	Center,
	BottomRight,
	Bottom,
	BottomLeft,
	Left
}

enum ScreenSize {
	None,
	ScreenWidth,
	ScreenHeight,
	HalfScreenWidth,
	HalfScreenHeight,
}

private class Stretch {
	var width : ScreenSize = ScreenSize.None;
	var height : ScreenSize = ScreenSize.None;
}

class OGWidget {
	var relativeTo : RelativePos = RelativePos.TopLeft;	
	var x : int = 0;
	var y : int = 0;
	var stretch : Stretch = new Stretch();
	var width : int = 16;
	var height : int = 16;
	
	var enabled = true;
	
	function SetPosition () {
		var modify_x = 0;
		var modify_y = 0;
		
		if ( relativeTo == RelativePos.TopLeft ) {
			// do nothing
		} else if ( relativeTo == RelativePos.Top ) {
			modify_x = ( Screen.width / 2 ) - ( width / 2 );
		} else if ( relativeTo == RelativePos.TopRight ) {
			modify_x = Screen.width - width;
		} else if ( relativeTo == RelativePos.Right ) {
			modify_x = Screen.width - width;
			modify_y = ( Screen.height / 2 ) - ( height / 2 );
		} else if ( relativeTo == RelativePos.BottomRight ) {
			modify_x = Screen.width - width;
			modify_y = Screen.height - height;
		} else if ( relativeTo == RelativePos.Bottom ) {
			modify_x = ( Screen.width / 2 ) - ( width / 2 );
			modify_y = Screen.height - height;
		} else if ( relativeTo == RelativePos.BottomLeft ) {
			modify_y = Screen.height - height;
		}  else if ( relativeTo == RelativePos.Left ) {
			modify_y = ( Screen.height / 2 ) - ( height / 2 );
		}
		
		x = modify_x + x;
		y = modify_y + y;
	}
	
	function SetDimensions () {
		var modify_width = 0;
		var modify_height = 0;
		
		if ( stretch.width == ScreenSize.ScreenWidth ) {
			modify_width = Screen.width;
		} else if ( stretch.width == ScreenSize.ScreenHeight ) {
			modify_width = Screen.height;
		} else if ( stretch.width == ScreenSize.HalfScreenWidth ) {
			modify_width = Screen.width / 2;
		} else if ( stretch.width == ScreenSize.HalfScreenHeight ) {
			modify_width = Screen.height / 2;
		}
		
		if ( stretch.height == ScreenSize.ScreenWidth ) {
			modify_height = Screen.width;
		} else if ( stretch.height == ScreenSize.ScreenHeight ) {
			modify_height = Screen.height;
		} else if ( stretch.height == ScreenSize.HalfScreenWidth ) {
			modify_height = Screen.width / 2;
		} else if ( stretch.height == ScreenSize.HalfScreenHeight ) {
			modify_height = Screen.height / 2;
		}
		
		width = modify_width + width;
		height = modify_height + height;
	}
	
	function Draw () {}

	function Update () {}
}