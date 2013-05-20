#pragma strict

import System.IO;

class Saver {
	static function SaveMap ( name : String, obj : GameObject ) {
		var path = Application.dataPath + "/Maps/" + name + ".vgmap";
		var sw : StreamWriter;
		
		if ( !File.Exists ( path ) ) {
			sw = File.CreateText ( path );
		} else {
			sw = new StreamWriter ( path );
		}
				
		sw.WriteLine ( Serializer.SerializeGameObject ( obj ) );
		sw.Flush();
		sw.Close();
	}

	static function SaveFlags ( table : JSONObject ) {
		var path = Application.dataPath + "/UserData/flags.vgdata";
		var sw : StreamWriter;
		
		if ( !File.Exists ( path ) ) {
			sw = File.CreateText ( path );
		} else {
			sw = new StreamWriter ( path );
		}
				
		sw.WriteLine ( table );
		sw.Flush();
		sw.Close();
	}

	static function SaveConversation ( chapter : String, scene : String, name : String, conversation : String, entries : List.< EditorConversationEntry > ) {
		var chapterPath = Application.dataPath + "/Conversations/" + chapter;
		var scenePath = chapterPath + "/" + scene;
		var actorPath = scenePath + "/" + name;
		var filePath = actorPath + "/" + conversation + ".vgconvo";
		
		var sw : StreamWriter;
		
		if ( !File.Exists ( chapterPath ) ) {
			Debug.Log ( "Saver | Created directory '" + chapterPath + "': " + Directory.CreateDirectory ( chapterPath ) );
		}
		
		if ( !File.Exists ( scenePath ) ) {
			Debug.Log ( "Saver | Created directory '" + scenePath + "': " + Directory.CreateDirectory ( scenePath ) );
		}
		
		if ( !File.Exists ( actorPath ) ) {
			Debug.Log ( "Saver | Created directory '" + actorPath + "': " + Directory.CreateDirectory ( actorPath ) );
		}
		
		if ( !File.Exists ( filePath ) ) {
			sw = File.CreateText ( filePath );
			
			Debug.Log ( "Saver | Created file '" + filePath + "': " + sw );
		
		} else {
			sw = new StreamWriter ( filePath );
		
			Debug.Log ( "Saver | Saved file '" + filePath + "': " + sw );	
		
		}
				
		sw.WriteLine ( Serializer.SerializeConversation ( entries ) );
		sw.Flush();
		sw.Close();
	}
}