#pragma strict

import System.Collections.Generic;

@script AddComponentMenu ("OpenGUI/DropDown")


class OGDropDown extends OGWidget {	
	// Classes
	private class DropDownItem {
		var name : String;
		var message : String;
	}
	
	// Vars
	var isDown = false;
	var title : String;
	var offset : Vector2 = new Vector2 ( 0, 20 );
	
	var target : GameObject;
	var submenu : DropDownItem[];
	
	// Draw
	override function Draw ( x : float, y : float ) {	
		if ( !guiStyle ) { guiStyle = GUI.skin.button; }
		
		// button
		if ( GUI.Button ( Rect ( x + guiStyle.padding.left, y, ( title.Length * 8 ), transform.localScale.y ), title, GUI.skin.label ) ) {
			isDown = !isDown;
		}
				
		// submenu
		if ( isDown ) {
			colliderRect = new Rect ( x - offset.x, y + offset.y, ( guiStyle.padding.left + guiStyle.padding.right ) + transform.localScale.x, ( submenu.Length * ( 12 + guiStyle.padding.top ) ) + ( guiStyle.padding.top + guiStyle.padding.bottom ) );
			GUI.Box ( colliderRect, "", guiStyle );
			
			for ( var i = 0; i < submenu.Length; i++ ) {			
				if ( GUI.Button ( Rect ( x - offset.x + guiStyle.padding.left, y + offset.y + ( guiStyle.padding.top / 2 ) + ( ( 12 + guiStyle.padding.top ) * i ), ( guiStyle.padding.left + guiStyle.padding.right ) + transform.localScale.x, transform.localScale.y ), submenu[i].name, GUI.skin.label ) ) {
					if ( target ) { target.SendMessage(submenu[i].message); }
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