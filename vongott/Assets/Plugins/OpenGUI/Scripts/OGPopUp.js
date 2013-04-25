#pragma strict

// Classes
class OGPopUp extends OGWidget {
	var title : String;
	var submenu : List.< KeyValuePair.<String, Function> > = new List.< KeyValuePair.<String, Function> > ();
	var selectedValue : int;
	
	var adjusted = false;
	var isUp = false;
	
	// Images
	var bg : Texture2D;
	
	// Styles
	var list : GUIStyle = new GUIStyle();
	var button : GUIStyle = new GUIStyle();
	var text : GUIStyle = new GUIStyle();
			
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
		
		text.normal.textColor = Color.white;
		text.fontSize = 12;
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
	function OGPopUp ( t : String ) {
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
		
		if ( selectedValue == null ) {
			selectedValue = 0;
		}
		
		GUI.Label ( Rect ( x, y, width, 32 ), title, text );
		
		// submenu
		if ( isUp ) {
			GUI.Box ( Rect ( x + (width*4), y - 4, 8 + width * 4, 8 + submenu.Count * 24 ), "" );
			
			for ( var i = 0; i < submenu.Count; i++ ) {			
				if ( GUI.Button ( Rect ( x  + (width*4), y + 4 + ( 24 * i ), (width * 4) + 8, 16 ), submenu[i].Key, list ) ) {
					submenu[i].Value();
					isUp = false;
					selectedValue = i;
				}
			}
		} else {			
			GUI.Box ( Rect ( x + (width*4), y - 4, 8 + ( width * 4 ), 24 ), "" );
			
			if ( GUI.Button ( Rect ( x + 8 + (width*4), y, ( width * 4 ) - 8, 16 ), submenu[selectedValue].Key, button ) ) {
				isUp = !isUp;
			}
		}
	}
	
	// Clear
	function Clear () {
		for ( var i = 0; i < submenu.Count; i++ ) {
			submenu.RemoveAt ( i );
		}
		
		submenu = new List.< KeyValuePair.<String, Function> > ();
		adjusted = false;
	}
	
	// Update
	override function Update () {
		if ( enabled ) {
			if ( !adjusted ) {
				SetWidth ();
				adjusted = true;
			}
			
			if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
				isUp = false;
			}
		}
	}
}