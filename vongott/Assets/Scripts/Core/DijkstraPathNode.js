#pragma strict

import System.Collections;
import System.Collections.Generic;

class DijkstraPathNode extends MonoBehaviour {
	var neighbors : GameObject[];
	var goal : GameObject;

	function OnDrawGizmos () {
		Gizmos.DrawWireCube ( transform.position, Vector3.one );
		for ( var neighbor : GameObject in neighbors ) {
			Gizmos.DrawLine ( transform.position, neighbor.transform.position );
			Gizmos.DrawWireSphere ( neighbor.transform.position, 0.25 );
		}
		
		if ( goal && neighbors.Length > 0 ) {
			Gizmos.color = Color.green;
			var current : GameObject = gameObject;
			var path : Stack.<GameObject> = Dijkstra.Run ( GameObject.FindGameObjectsWithTag("Node"), gameObject, goal );
			for ( var obj : GameObject in path ) {
				Gizmos.DrawWireSphere (obj.transform.position, 1.0 );
				Gizmos.DrawLine ( current.transform.position, obj.transform.position );
				current = obj;
			}
		}
	}
}