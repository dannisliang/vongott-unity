#pragma strict

class EditorInspectorSpawnPoint extends MonoBehaviour {
	public var spawnPointName : OGTextField;
	
	private var spawnPoint : SpawnPoint;
	
	function Init ( obj : GameObject ) {
		spawnPoint = obj.GetComponent ( SpawnPoint );
		
		spawnPointName.text = spawnPoint.name;
	}
	
	function Rename () {
		if ( spawnPointName.text == "" ) { spawnPointName.text = "spawnpoint"; }
		spawnPoint.name = spawnPointName.text;
	}
}