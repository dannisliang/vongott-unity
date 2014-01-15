﻿#pragma strict

public class OGTickBox extends OGWidget {
	public var text : String;
	public var isTicked : boolean;
	
	override function OnMouseDown () {
		isTicked = !isTicked;
		
		GetRoot().ReleaseWidget ();
	}

	
	////////////////
	// Rects
	////////////////	
	private function GetTickRect () : Rect {
		return new Rect ( drawRct.x + drawRct.width - drawRct.height, drawRct.y, drawRct.height, drawRct.height );
	}


	////////////////
	// Update
	////////////////	
	override function UpdateWidget () {
		// Mouse	
		mouseRct = drawRct;
		
		// Styles
		if ( isTicked ) {
			currentStyle = styles.ticked;
		} else {
			currentStyle = styles.basic;
		}
	}


	////////////////
	// Draw
	////////////////	
	override function DrawSkin () {
		OGDrawHelper.DrawSprite ( GetTickRect(), currentStyle.coordinates, drawDepth );
	}

	override function DrawText () {
		OGDrawHelper.DrawLabel ( drawRct, text, currentStyle.text, drawDepth );
	}
}
