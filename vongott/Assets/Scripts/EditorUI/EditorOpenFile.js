#pragma strict

import System.IO;

class EditorOpenFile extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var background : OGRect;
	var okButton : OGButton;
	var cancelButton : OGButton;
	
	// Static vars
	static var selectedMap : String = "";
	static var title : OGLabel;
	static var mapList : OGScrollView;
	
	// Private classes
	private class ListItem {
		var name : String;
		var button : OGButton;
		
		var select : Function = function () {
			selectedMap = name;
			title.text = "Open a map ( " + name + " )";
		};
		
		function ListItem ( p : String, i : int ) {
			var path = p.Split("\\"[0]);
			var fileName = path[path.Length-1];
			var extention = fileName.Split("."[0]);
			
			name = extention[0];
			
			button = new OGButton ( name, select );
			button.width = mapList.width - 32;
			button.height = 32;
			button.x = 24;
			button.y = i * 34;
			
			mapList.Add ( button );
		}
	}
	
	////////////////////
	// Navigation
	////////////////////
	// List files
	function ListFiles () : String[] {		
		var files : String[] = Directory.GetFiles ( Application.dataPath + "/Maps", "*.vgmap" );
		
		return files;
	}
	
	// OK
	var ok : Function = function () {		
		if ( selectedMap == "" ) {
			return;
		}
		
		EditorCore.LoadFile ( selectedMap );
		OGPageManager.GoToPage ( "BaseMenu" );
	};
	
	// Cancel
	var cancel : Function = function () {
		OGPageManager.GoToPage ( "BaseMenu" );
	};
	
	
	////////////////////
	// Init
	////////////////////
	override function Init () {		
		// background
		background = new OGRect ();
		background.x = ( Screen.width / 2 ) - ( Screen.width * 0.4 );
		background.y = ( Screen.height / 2 ) - ( Screen.height * 0.4 );
		background.width = Screen.width * 0.8;
		background.height = Screen.height * 0.8;
		
		// title
		title = new OGLabel ( "Open a map" );
		title.x = background.x + 16;
		title.y = background.y + 16;
		title.style.fontStyle = FontStyle.Bold;
		title.style.fontSize = 14;
		
		// ok button
		okButton = new OGButton ( "OK", ok );
		okButton.width = 128;
		okButton.height = 32;
		okButton.x = background.x + ( background.width / 2 ) - okButton.width - 8;
		okButton.y = background.y + background.height - 48;
		
		// cancel button
		cancelButton = new OGButton ( "Cancel", cancel );
		cancelButton.width = 128;
		cancelButton.height = 32;
		cancelButton.x = background.x + ( background.width / 2 ) + 8;
		cancelButton.y = okButton.y;
		
		// map list
		mapList = new OGScrollView ();
			
		mapList.x = background.x;
		mapList.y = background.y + 64;
		mapList.width = background.width;
		mapList.height = background.height - 128;
		
		var paths : String[] = ListFiles();
		var items : ListItem[] = new ListItem[paths.Length];
		
		for ( var i = 0; i < paths.Length; i++ ) {
			items[i] = new ListItem ( paths[i], i );
		}
	
		// add widgets
		OGCore.Add ( background );
		OGCore.Add ( mapList );
		OGCore.Add ( title );
		OGCore.Add ( okButton );
		OGCore.Add ( cancelButton );
	}
	
	////////////////////
	// Update
	////////////////////
	override function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGPageManager.GoToPage ( "BaseMenu" );
		}
	}
}