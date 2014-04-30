#pragma strict

public class OEFileSystem {
	public static function GetFiles ( dir : String ) : Object [] {
		return Resources.LoadAll ( dir );
	}

	public static function GetDirectoryNames ( root : String ) : String [] { 
		var files : Object[] = GetFiles ( root );
		var tempNames : List.< String > = new List.< String > ();

		for ( var i : int = 0; i < files.Length; i++ ) {
			var n : String = "[ERROR]";
			
			if ( files[i].GetType() == typeof ( GameObject ) ) {
				n = ( files[i] as GameObject ).name;
			}
				
			tempNames.Add ( n );
		}

		return tempNames.ToArray ();
	}	
}
