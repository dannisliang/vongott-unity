#pragma strict

import System.IO;

class Loader {
	static function LoadConversationToEditor ( path : String ) : List.< EditorConversationEntry > {
		var entries : List.< EditorConversationEntry >;
		
		path = Application.dataPath + "/Conversations/" + path + ".vgconvo";
				
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
		
		entries = Deserializer.DeserializeConversationToEditor ( input );
		
		return entries;
	}
	
	static function LoadConversationToGame ( path : String ) : String {
		var entries : List.< EditorConversationEntry >;
		
		path = Application.dataPath + "/Conversations/" + path + ".vgconvo";
				
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
	
	static function LoadFlags () : JSONObject {
		var path = Application.dataPath + "/UserData/flags.vgdata";
		
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
		
		return new JSONObject ( input );
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