#pragma strict

import System.IO;

class MainMenuLoad extends OGPage {
	public var levelList : Transform;

	private function TrimFileName ( p : String ) : String {
		var path : String[] = p.Split("/"[0]);
		
		if ( Application.platform == RuntimePlatform.WindowsEditor ) {
			path = p.Split("\\"[0]);
		}
		
		var fileName : String = path[path.Length-1];
		var extention : String [] = fileName.Split("."[0]);
		var name : String = extention[0];
		
		return name;
	}

	private function CreateButton ( mapName : String ) {
		var btn : OGListItem = new GameObject ( mapName, OGListItem ).GetComponent ( OGListItem );
		var index : int = levelList.childCount;
		
		btn.text = mapName;
		btn.target = this.gameObject;
		btn.message = "LoadFile";
		btn.argument = mapName;
		btn.GetDefaultStyles();

		btn.transform.parent = levelList;
		btn.transform.localScale = new Vector3 ( 200, 30, 1 );
		btn.transform.localPosition = new Vector3 ( 0, index * 40, 0 );
	}
	
	private function PopulateMaps () {
		var files : String[] = Directory.GetFiles ( Application.dataPath + "/Maps", "*.vgmap" );
	
		for ( var s : String in files ) {
			CreateButton ( TrimFileName ( s ) );
		}
	}
	
	public function LoadFile ( mapName : String ) {		
		LoadingManager.nextScene = mapName;
	
		Application.LoadLevel ( "loading" );
	}

	public function GoBack () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	override function StartPage () {
		PopulateMaps ();
	}
}
