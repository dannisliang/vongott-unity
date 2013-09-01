#pragma strict

class MainMenuLoad extends OGPage {
	var mainMenu : MainMenu;
	
	var mapList : OGScrollView;
	
	// Clear list
	function ClearList () {
		for ( var i = 0; i < mapList.transform.childCount; i++ ) {
			DestroyImmediate ( mapList.transform.GetChild ( i ).gameObject );
		}
	}
	
	// Trim filename
	function TrimFileName ( p : String ) : String {
		var path = p.Split("\\"[0]);
		var fileName = path[path.Length-1];
		var extention = fileName.Split("."[0]);
		var name = extention[0];
		
		return name;
	}
	
	// Select map
	function SelectFile ( name : String ) {
		GameCore.nextLevel = name;
		Application.LoadLevel ( "game" );
	}
	
	// Populate list
	function PopulateList () {		
		ClearList ();
		
		var paths : String[] = Directory.GetFiles ( Application.dataPath + "/Maps", "*.vgmap" );
			
		for ( var i = 0; i < paths.Length; i++ ) {
			var name = TrimFileName ( paths[i] );
			var obj : GameObject = new GameObject ( name );
			var btn = obj.AddComponent ( OGButton );
		
			btn.text = name;
			btn.target = this.gameObject;
			btn.message = "SelectFile";
			btn.argument = name;
			
			obj.transform.parent = mapList.transform;
			obj.transform.localScale = new Vector3 ( 468, 30, 1 );
			obj.transform.localPosition = new Vector3 ( 0, i * 32, -2 );
		}
	}
	
	override function StartPage () {
		PopulateList ();
	}
	
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			mainMenu.Transition ( "" );
		}
	}
}