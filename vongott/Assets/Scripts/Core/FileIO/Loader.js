#pragma strict

import System.IO;

class Loader {
	static function ReadFileToArray ( path : String ) : String[] {
		if ( !File.Exists ( path ) ) {
			Debug.LogError ( "Loader | no such file: " + path );
			return null;
		}
		
		var sr : StreamReader = new File.OpenText( path );
		var input : List.<String> = new List.<String>();
		var line : String = "";
		
		line = sr.ReadLine();
		
		while ( line != null ) {
			input.Add ( line );
			line = sr.ReadLine();
		}
	
		sr.Close();
		
		return input.ToArray();
	}

	static function ReadFile ( path : String ) : String {
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
		
		return input;
	}
	
	static function LoadOBJ ( path : String ) : Mesh {
		var mesh : Mesh = new Mesh();
		var strings : String[] = ReadFileToArray ( path );
		
		return Deserializer.DeserializeOBJ ( strings );
	}
	
	static function LoadConversationTree ( path : String ) : ConversationTree {
		var tree : ConversationTree;
		
		path = Application.dataPath + "/Story/Conversations/" + path + ".vgconvo";
		
		Debug.Log ( "Loader | Loading conversation tree: " + path );
		
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		tree = Deserializer.DeserializeConversationTree ( input );
		
		return tree;
	}
	
	static function LoadScreenshot ( path : String ) : byte[] {
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		return Deserializer.DeserializeScreenshot ( input );
	}
	
	static function LoadFlags () : JSONObject {
		var path = Application.dataPath + "/Story/flags.vgdata";
		
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		return new JSONObject ( input, false );
	}
	
	static function LoadQuests () : JSONObject {
		var path = Application.dataPath + "/Story/Quests/quests.vgdata";
		
		var input : String = ReadFile ( path );	
		if ( !input ) { input = ""; }
		
		var quests : JSONObject = new JSONObject ( input, false );
	
		return quests;
	}
	
	static function LoadEvents () : JSONObject {
		var path = Application.dataPath + "/Story/Events/events.vgdata";
		
		var input : String = ReadFile ( path );	
		if ( !input ) { input = ""; }
		
		var events : JSONObject = new JSONObject ( input, false );
	
		return events;
	}
	
	static function LoadQuest ( id : String ) : Quest {
		var path = Application.dataPath + "/Story/Quests/quests.vgdata";
				
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		var object : JSONObject = new JSONObject ( input, false );
		if ( !object.HasField ( id ) ) { return null; }
		
		var quest : Quest = Deserializer.DeserializeQuest ( object.GetField ( id ) );
	
		return quest;
	}
	
	static function LoadEvent ( id : String ) : GameEvent {
		var path = Application.dataPath + "/Story/Events/events.vgdata";
				
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		var object : JSONObject = new JSONObject ( input, false );
		if ( !object.HasField ( id ) ) { return null; }
		
		var event : GameEvent = Deserializer.DeserializeGameEvent ( object.GetField ( id ) );
	
		return event;
	}
	
	static function LoadSpawnPoints ( name : String ) : String[] {
		var points : String[];
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
		
		points = Deserializer.DeserializeSpawnPoints ( input );
	
		return points;
		
	}
	
	static function LoadMap ( name : String ) : GameObject {
		return LoadMap ( name, "" );
	}
	
	static function LoadMap ( name : String, spawnPoint : String ) : GameObject {
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
