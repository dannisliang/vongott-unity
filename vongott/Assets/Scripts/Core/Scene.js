#pragma strict

class Scene {
	var index : int;
	var map : Map;
	var spawnPoint : Vector3;
	
	function Scene ( i : int, m : Map ) {
		index = i;
		map = m;
		spawnPoint = m.spawnPoints[i];
	}
}