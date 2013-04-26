#pragma strict

import System.Collections.Generic;

@script ExecuteInEditMode

// Classes
private class DropDownItem {
	var name : String;
	var message : String;
}

class OGDropDown extends OGWidget {	
	var isDown = false;
	var title : String;
	var font : Font;
	var style : FontStyle;
	var size : int = 12;
	var alignment : TextAnchor;
	var highlight : Color = Color.white;
	var titleNormal : Color = Color.white;
	var titleHover : Color = Color.blue;
	var textNormal : Color = Color.white;
	var textHover : Color = Color.black;
	var padding : Vector2;
	var offset : Vector2;
	
	var target : GameObject;
	var submenu : DropDownItem[];
	
	// Image
	@HideInInspector var bg : Texture2D;
	
	// Styles
	@HideInInspector var list : GUIStyle = new GUIStyle();
	@HideInInspector var button : GUIStyle = new GUIStyle();
		
	// Init
	function Start () {	
		bg = new Texture2D(2,2);
	}
	
	// Draw
	override function Draw ( x : float, y : float ) {				
		// button
		if ( GUI.Button ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), title, button ) ) {
			isDown = !isDown;
		}
				
		// submenu
		if ( isDown ) {
			GUI.Box ( Rect ( x - offset.x, y + offset.y, ( padding.x * 2 ) + transform.localScale.x, ( submenu.Length * offset.y ) + ( padding.y * 2 ) ), "" );
			
			for ( var i = 0; i < submenu.Length; i++ ) {			
				if ( GUI.Button ( Rect ( x - offset.x, y + offset.y + 4 + ( offset.y * i ), ( padding.x * 2 ) + transform.localScale.x, transform.localScale.y ), submenu[i].name, list ) ) {
					target.SendMessage(submenu[i].message);
					isDown = false;
				}
			}
		}
	}
	
	// Update
	override function UpdateWidget () {
		bg.SetPixels([highlight,highlight,highlight,highlight]);
		bg.Apply();
		
		list.font = font;
		list.fontSize = size;
		list.normal.textColor = textNormal;
		list.hover.background = bg;
		list.hover.textColor = textHover;
		list.padding.left = padding.x;
		list.padding.top = padding.y;
		
		button.font = font;
		button.fontSize = size;
		button.normal.textColor = titleNormal;
		button.onHover.textColor = titleHover;
		
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			isDown = false;
		}
	}
}