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
		
		path = Application.dataPath + "/Conversations/" + path + ".vgconvo";
		
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		entries = Deserializer.DeserializeConversationToEditor ( input );
		
		return entries;
	}
	
	static function LoadConversationToGame ( path : String ) : String {
		var entries : List.< EditorConversationEntry >;
		
		path = Application.dataPath + "/Conversations/" + path + ".vgconvo";
				
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
	
	static function LoadQuest ( chapter : String, scene : String, id : String ) : Quest {
		var path = Application.dataPath + "/Quests/" + chapter + "/" + scene + "/" + id + ".vgquest";
		
		var input : String = ReadFile ( path );	
		if ( !input ) { return null; }
		
		var quest : Quest = Deserializer.DeserializeQuest ( input );
	
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