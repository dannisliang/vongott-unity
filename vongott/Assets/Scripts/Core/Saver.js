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
}