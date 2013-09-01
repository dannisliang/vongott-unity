#pragma strict

class PrefabManager {
	/*static var allPrefabs : List.< Prefab > = new List.< Prefab >();

	static function LoadDir ( path : String ) {
		var dirObjects : GameObject[] = Resources.LoadAll ( "Prefabs/" + path, GameObject );
		
		for ( var o : GameObject in dirObjects ) {
			var prefab = new Prefab ( o.name, "Prefabs/" + path + "/" + o.name );
			allPrefabs.Add ( prefab );
		}
	}
	
	static function GetPrefabs ( dirPath : String ) : List.< Prefab > {
		var foundPrefabs : List.< Prefab > =  new List.< Prefab >();
	
		for ( var p : Prefab in allPrefabs ) {
			if ( p.path == "Prefabs/" + dirPath + "/" + p.id ) {
				foundPrefabs.Add ( p );
			}
		}
		
		return foundPrefabs;
	}
	
	static function GetPrefab ( fullPath : String ) : Prefab {
		for ( var p : Prefab in allPrefabs ) {
			if ( p.path == "Prefabs/" + fullPath ) {
				return p;
			}
		}
		
		return null;
	}*/
}