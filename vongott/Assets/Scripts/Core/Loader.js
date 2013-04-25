#pragma strict

import System.IO;

class Loader {
	static function LoadChapter ( c : int ) {
		/* TODO
		get chapter from directory
		var chapter = new Chapter ( index, title, writtenBy );
		for ( var i = 0; i < [the loaded chapter].Length; i++ ) {
			var scene = new Scene ( [current scene].index, [current scene].map );
			
			chapter.AddScene ( scene );
		}
		GameCore.currentChapter = chapter;
		*/
	}
	
	static function LoadScene ( s : int ) {
		if ( GameCore.currentChapter == null ) {
			GameCore.Print ( "Loader | no chapter loaded!" );
		} else if ( GameCore.currentChapter.scenes[s] == null ) {
			GameCore.Print ( "Loader | no scene " + s + " in chapter " + GameCore.currentChapter.title + "!" );
		} else {
			GameCore.currentScene = GameCore.currentChapter.scenes[s];
		}
	}
		
	static function LoadMap ( name : String ) : GameObject {
		var map : GameObject;
		var path = Application.dataPath + "/Maps/" + name + ".vgmap";
				
		if ( !File.Exists ( path ) ) {
			Debug.LogError ( "Loader | no such file: " + path );
			return null;
		}
		
		var sr : StreamReader = new File.OpenText( path );
		var input : String = "";
		var line : String = "";
		
		line = sr.ReadLine();
		
		while ( line != null ) {
			input += line;
			line = sr.ReadLine();
		}
	
		sr.Close();
		
		map = Deserializer.DeserializeGameObject ( input );
	
		return map;
	}
}