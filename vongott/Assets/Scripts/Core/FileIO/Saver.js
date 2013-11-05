#pragma strict

import System.IO;

class Saver {
	static function CheckBackups ( path : String ) {
		if ( File.Exists ( path + "_backup2" ) ) {
			File.Copy ( path + "_backup2", path + "_backup3", true );
		}
								
		if ( File.Exists ( path + "_backup1" ) ) {
			File.Copy ( path + "_backup1", path + "_backup2", true );
		}
		
		if ( File.Exists ( path ) ) {
			File.Copy ( path, path + "_backup1", true );
		}
	}
	
	static function SaveMap ( name : String, obj : GameObject, screenshot : Texture2D ) {
		var path = Application.dataPath + "/Maps/" + name + ".vgmap";
		
		CheckBackups ( path );

		var sw : StreamWriter;
		
		if ( !File.Exists ( path ) ) {
			sw = File.CreateText ( path );
			Debug.Log ( "Saver | Created file '" + path + "': " + sw );
		} else {
			sw = new StreamWriter ( path );
		}
		
		var serialized : JSONObject = Serializer.SerializeGameObject ( obj );
		
		serialized.AddField ( "Camera", Serializer.SerializeTransform ( Camera.main.transform ) );
		serialized.AddField ( "screenshot", Serializer.SerializeScreenshot ( screenshot ) );
		
		if ( GameObject.FindObjectOfType(SkyBox) ) {
			serialized.AddField ( "Skybox", GameObject.FindObjectOfType(SkyBox).name.Replace( "(Clone)", "" ) );
		}
		
		sw.WriteLine ( serialized );
		sw.Flush();
		sw.Close();
		
		UnityEngine.Object.Destroy ( screenshot );
	}

	static function SaveQuest ( quest : Quest ) {
		var basePath = Application.dataPath + "/Story/Quests";
		var filePath = basePath + "/quests.vgdata";
		
		var allQuests : JSONObject = Loader.LoadQuests();

		if ( allQuests.HasField ( quest.id ) ) {
			allQuests.SetField ( quest.id, Serializer.SerializeQuest ( quest ) );
		} else {
			allQuests.AddField ( quest.id, Serializer.SerializeQuest ( quest ) );
		}
		
		var sw : StreamWriter;
		
		if ( !File.Exists ( basePath ) ) {
			Debug.Log ( "Saver | Created directory '" + basePath + "': " + Directory.CreateDirectory ( basePath ) );
		}
		
		if ( !File.Exists ( filePath ) ) {
			sw = File.CreateText ( filePath );
		} else {
			sw = new StreamWriter ( filePath );
		}
		
		sw.WriteLine ( allQuests );
		sw.Flush();
		sw.Close();
	}
	
	static function SaveEvent ( event : GameEvent ) {
		var basePath = Application.dataPath + "/Story/Events";
		var filePath = basePath + "/events.vgdata";
		
		var allEvents : JSONObject = Loader.LoadEvents();

		if ( allEvents.HasField ( event.id ) ) {
			allEvents.SetField ( event.id, Serializer.SerializeGameEvent ( event ) );
		} else {
			allEvents.AddField ( event.id, Serializer.SerializeGameEvent ( event ) );
		}
		
		var sw : StreamWriter;
		
		if ( !File.Exists ( basePath ) ) {
			Debug.Log ( "Saver | Created directory '" + basePath + "': " + Directory.CreateDirectory ( basePath ) );
		}
		
		if ( !File.Exists ( filePath ) ) {
			sw = File.CreateText ( filePath );
		} else {
			sw = new StreamWriter ( filePath );
		}
		
		sw.WriteLine ( allEvents );
		sw.Flush();
		sw.Close();
	}
	
	static function SaveFlags ( table : JSONObject ) {
		var path = Application.dataPath + "/Story/flags.vgdata";
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

	static function SaveConversationTree ( path : String, rootNodes : Transform ) {
		var pathArray : String[] = path.Split ( "/"[0] );
		var chapterPath = Application.dataPath + "/Story/Conversations/" + pathArray[0];
		var scenePath = chapterPath + "/" + pathArray[1];
		var actorPath = scenePath + "/" + pathArray[2];
		var filePath = actorPath + ".vgconvo";
		
		CheckBackups ( filePath );
		
		var sw : StreamWriter;
		
		if ( !File.Exists ( chapterPath ) ) {
			Debug.Log ( "Saver | Created directory '" + chapterPath + "': " + Directory.CreateDirectory ( chapterPath ) );
		}
		
		if ( !File.Exists ( scenePath ) ) {
			Debug.Log ( "Saver | Created directory '" + scenePath + "': " + Directory.CreateDirectory ( scenePath ) );
		}
		
		if ( !File.Exists ( filePath ) ) {
			sw = File.CreateText ( filePath );
			
			Debug.Log ( "Saver | Created file '" + filePath + "': " + sw );
		
		} else {
			sw = new StreamWriter ( filePath );
		
			Debug.Log ( "Saver | Saved file '" + filePath + "': " + sw );	
		
		}
				
		sw.WriteLine ( Serializer.SerializeConversationTree ( rootNodes ) );
		sw.Flush();
		sw.Close();
	}
}