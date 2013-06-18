#pragma strict

import System.IO;

class Saver {
	static function SaveMap ( name : String, obj : GameObject, screenshot : Texture2D ) {
		var path = Application.dataPath + "/Maps/" + name + ".vgmap";
		var sw : StreamWriter;
		
		if ( !File.Exists ( path ) ) {
			sw = File.CreateText ( path );
		} else {
			sw = new StreamWriter ( path );
		}
		
		var serialized : JSONObject = Serializer.SerializeGameObject ( obj );
		
		serialized.AddField ( "Camera", Serializer.SerializeTransform ( Camera.main.transform ) );
		serialized.AddField ( "screenshot", Serializer.SerializeScreenshot ( screenshot ) );
		
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
		var chapterPath = Application.dataPath + "/Story/Conversations/" + chapter;
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