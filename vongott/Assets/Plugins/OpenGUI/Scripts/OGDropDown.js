#pragma strict

// Classes
class OGDropDown extends OGWidget {
	var title : String;
	var submenu : List.< KeyValuePair.<String, Function> > = new List.< KeyValuePair.<String, Function> > ();
	
	var adjusted = false;
	var isDown = false;
	
	// Images
	var bg : Texture2D;
	
	// Styles
	var list : GUIStyle = new GUIStyle();
	var button : GUIStyle = new GUIStyle();
		
	// Init
	private function Init () {	
		bg = new Texture2D(2,2);
		bg.SetPixels([Color.white,Color.white,Color.white,Color.white]);
		bg.Apply();
		
		list.normal.textColor = Color.white;
		list.hover.background = bg;
		list.hover.textColor = Color.black;
		list.padding.left = 8;
		
		button.normal.textColor = Color.white;
	}
	
	// Set width
	private function SetWidth () {
		for ( var kvp : KeyValuePair.<String, Function> in submenu ) {
			if ( width < ( kvp.Key.Length * 2 ) ) {
				width = ( kvp.Key.Length * 2 );
			}
		}
	}
	
	// Constructor
	function OGDropDown ( t : String ) {
		title = t;
		
		Init ();
	}
	
	// Add submenu item
	function Add ( str : String, func : Function ) {
		var kvp : KeyValuePair.<String, Function> = new KeyValuePair.<String, Function>( str, func );
		submenu.Add ( kvp );
	}
	
	// Draw
	override function Draw () {	
		if ( !enabled ) {
			return;
		}
				
		// button
		if ( GUI.Button ( Rect ( x, y, ( width * 4 ) - 8, 16 ), title, button ) ) {
			isDown = !isDown;
		}
				
		// submenu
		if ( isDown ) {
			GUI.Box ( Rect ( x-8, y+32, 8 + width * 4, 8 + submenu.Count * 24 ), "" );
			
			for ( var i = 0; i < submenu.Count; i++ ) {			
				if ( GUI.Button ( Rect ( x-8, 56 + ( 24 * i ), (width * 4) + 8, 16 ), submenu[i].Key, list ) ) {
					submenu[i].Value();
					isDown = false;
				}
			}
		}
	}
	
	// Update
	override function Update () {
		if ( !adjusted ) {
			SetWidth ();
			adjusted = true;
		}
		
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			isDown = false;
		}
	}
}