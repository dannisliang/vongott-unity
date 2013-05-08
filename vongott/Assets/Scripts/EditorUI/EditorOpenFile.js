#pragma strict

import System.IO;

class EditorOpenFile extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var mapList : OGScrollView;
	var title : OGLabel;
	
	// Static vars
	static var selectedMap : String = "";
	
		
	////////////////////
	// Navigation
	////////////////////
	// List files
	function ListFiles () : String[] {		
		var files : String[] = Directory.GetFiles ( Application.dataPath + "/Maps", "*.vgmap" );
		
		return files;
	}
	
	// Set selected map
	function SelectFile ( name : String ) {
		selectedMap = name;
		title.text = "Open a map file ( " + name + " )";
		
	}
	
	// OK
	function OK () {		
		if ( selectedMap == "" ) {
			return;
		}
		
		EditorCore.LoadFile ( selectedMap );
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	// Trim filename
	function TrimFileName ( p : String ) : String {
		var path = p.Split("\\"[0]);
		var fileName = path[path.Length-1];
		var extention = fileName.Split("."[0]);
		var name = extention[0];
		
		return name;
	}
	
	// Clear list
	function ClearList () {
		for ( var i = 0; i < mapList.transform.childCount; i++ ) {
			DestroyImmediate ( mapList.transform.GetChild ( i ).gameObject );
		}
	}
	
	// Populate list
	function PopulateList () {
		ClearList ();
		
		var paths : String[] = ListFiles();
	
		for ( var i = 0; i < paths.Length; i++ ) {
			var name = TrimFileName ( paths[i] );
			var obj : GameObject = new GameObject ( name );
			var btn = obj.AddComponent ( OGButton );
		
			btn.style = "Button";
			btn.text = name;
			btn.target = this.gameObject;
			btn.message = "SelectFile";
			btn.argument = name;
			
			obj.transform.parent = mapList.transform;
			obj.transform.localScale = new Vector3 ( 482, 32, 1 );
			obj.transform.localPosition = new Vector3 ( 0, i * 34, -2 );
		}
	}
	
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		PopulateList();
		selectedMap == "";
		title.text = "Open a map file";
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGRoot.GoToPage ( "MenuBase" );
		}
	}
}