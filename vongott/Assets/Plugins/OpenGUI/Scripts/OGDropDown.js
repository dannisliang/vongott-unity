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
	var offset : Vector2;
	
	var target : GameObject;
	var submenu : DropDownItem[];
		
	var style : GUIStyle;
	
	// Draw
	override function Draw ( x : float, y : float ) {				
		// button
		if ( GUI.Button ( Rect ( x, y, transform.localScale.x, transform.localScale.y ), title, style ) ) {
			isDown = !isDown;
		}
				
		// submenu
		if ( isDown ) {
			GUI.Box ( Rect ( x - offset.x, y + offset.y, ( style.padding.left + style.padding.right ) + transform.localScale.x, ( submenu.Length * offset.y ) + ( style.padding.top + style.padding.bottom ) ), "" );
			
			for ( var i = 0; i < submenu.Length; i++ ) {			
				if ( GUI.Button ( Rect ( x - offset.x, y + offset.y + 4 + ( offset.y * i ), ( style.padding.left + style.padding.right ) + transform.localScale.x, transform.localScale.y ), submenu[i].name, style ) ) {
					target.SendMessage(submenu[i].message);
					isDown = false;
				}
			}
		}
	}
	
	// Update
	override function UpdateWidget () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			isDown = false;
		}
	}
}