#pragma strict

import System.IO;

class Loader {
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
	
	static function LoadConversationToEditor ( path : String ) : List.< EditorConversationEntry > {
		var entries : List.< EditorConversationEntry >;
		
		path = Application.dataPath + "/Story/Conversations/" + path + ".vgconvo";
		
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		entries = Deserializer.DeserializeConversationToEditor ( input );
		
		return entries;
	}
	
	static function LoadConversationToGame ( path : String ) : String {
		var entries : List.< EditorConversationEntry >;
		
		path = Application.dataPath + "/Story/Conversations/" + path + ".vgconvo";
				
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		return input;
	}
	
	static function LoadScreenshot ( path : String ) : Texture2D {
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		return Deserializer.DeserializeScreenshot ( input );
	}
	
	static function LoadFlags () : JSONObject {
		var path = Application.dataPath + "/UserData/flags.vgdata";
		
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		return new JSONObject ( input );
	}
	
	static function LoadQuests () : JSONObject {
		var path = Application.dataPath + "/Story/Quests/quests.vgdata";
		
		var input : String = ReadFile ( path );	
		if ( !input ) { input = ""; }
		
		var quests : JSONObject = new JSONObject ( input );
	
		return quests;
	}
	
	static function LoadQuest ( id : String ) : Quest {
		var path = Application.dataPath + "/Story/Quests/quests.vgdata";
				
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		var object : JSONObject = new JSONObject ( input );
		if ( !object.HasField ( id ) ) { return null; }
		
		var quest : Quest = Deserializer.DeserializeQuest ( object.GetField ( id ) );
	
		return quest;
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