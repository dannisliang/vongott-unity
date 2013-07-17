#pragma strict

import System.Collections;
import System.Collections.Generic;

class DijkstraPathNode extends MonoBehaviour {
	var neighbors : List.< GameObject > = new List.< GameObject > ();
	var nodeRadius : float = 50.0;
	var nodeLayerMask : LayerMask;
	var collisionMask : LayerMask;

	function OnDrawGizmos () {
		Gizmos.DrawWireCube ( transform.position, Vector3.one );
		for ( var neighbor : GameObject in neighbors ) {
			Gizmos.DrawLine ( transform.position, neighbor.transform.position );
			Gizmos.DrawWireSphere ( neighbor.transform.position, 0.25 );
		}
	}
	
	function Start () {
		FindNeighbors ();
	}
	
	function FindNeighbors () {
		neighbors.Clear ();
		
		var cols : Collider [] = Physics.OverlapSphere ( transform.position, nodeRadius, nodeLayerMask );
	
		for ( var node : Collider in cols ) {
			if ( node.gameObject != gameObject ) {
				var hit : RaycastHit;
				
				Physics.Raycast ( transform.position, ( node.transform.position - transform.position ), hit, nodeRadius, collisionMask );
				
				if ( hit.transform != null ) {
					if ( hit.transform.gameObject == node.gameObject ) {
						neighbors.Add ( node.gameObject );
					}
				}
			}
		}
	}
}