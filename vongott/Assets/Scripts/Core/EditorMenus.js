#pragma strict

////////////////////
// Prerequisites
////////////////////
// Classes
private class DropDown {
	var title : String;
	var submenu : String[];
	var x : int;
	var y : int;
	var width : int;
	
	var isDown = false;
	
	var list : GUIStyle;
	var button : GUIStyle;
	
	function DropDown ( t : String, s : String[], xpos : int, ypos : int ) {
		title = t;
		submenu = s;
		x = xpos;
		y = ypos;
		
		var bg = new Texture2D(2,2);
		bg.SetPixels([Color.white,Color.white,Color.white,Color.white]);
		bg.Apply();
		
		list = new GUIStyle();
		list.normal.textColor = Color.white;
		list.hover.background = bg;
		list.hover.textColor = Color.black;
		list.padding.left = 8;
	
		button = new GUIStyle();
		button.normal.textColor = Color.white;
		
		for ( var str : String in submenu ) {
			if ( width < str.Length ) {
				width = str.Length;
			}
		}
	}
	
	function Draw () {	
		// Root
		if ( GUI.Button ( Rect ( x, y, 64, 30 ), title, button ) ) {
			isDown = !isDown;
		}
				
		// Submenu
		if ( isDown ) {
			GUI.Box ( Rect ( x-8, y+32, 8 + width * 8, 8 + submenu.Length * 24 ), "" );
			
			for ( var i = 0; i < submenu.Length; i++ ) {			
				if ( GUI.Button ( Rect ( x-8, 56 + ( 24 * i ), (width * 8) + 8, 16 ), submenu[i], list ) ) {
					Debug.Log ( "picked " + submenu[i] );
				}
			}
		}
	}
}

// Private vars
private var gui_menu_file : DropDown;
private var gui_menu_view : DropDown;
private var gui_menu_help : DropDown;


////////////////////
// Public functions
////////////////////
// Init
function Start () {
	// menus
	gui_menu_file = new DropDown ( "File", ["New", "Open", "Save", "Save As..", "Exit"], 16, 16 );	
	gui_menu_view = new DropDown ( "View", ["Iso/Persp", "Wireframe", "Lighting on/off"], 96, 16 );
}

// Update
function Update () {
	
}

// Draw
function OnGUI () {	
	if ( EditorCore.menusActive ) {
		// Top toolbar
		GUI.Box ( Rect ( 8, 8, Screen.width - 16, 32 ), "" );
	
		// Menus
		gui_menu_file.Draw();
		gui_menu_view.Draw();
	}
}