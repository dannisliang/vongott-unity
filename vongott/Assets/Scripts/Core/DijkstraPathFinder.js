#pragma strict

import System.Collections;
import System.Collections.Generic;

class DijkstraPathFinder extends MonoBehaviour {
	var target : Transform;
	var speed : float = 3.0;
	
	function Update () {
		if ( gameObject.GetComponent(DijkstraCurrentNode).currentNode == target.GetComponent(DijkstraCurrentNode).currentNode ) {		
			transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( target.position - transform.position ), 5 * Time.deltaTime );

		} else {
			var path : Stack.<GameObject> = Dijkstra.Run ( GameObject.FindGameObjectsWithTag("Node"), gameObject.GetComponent(DijkstraCurrentNode).currentNode, target.gameObject.GetComponent(DijkstraCurrentNode).currentNode );
				
			var goal : GameObject = path.Pop ();
			transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( goal.transform.position - transform.position ), 5 * Time.deltaTime );

			transform.localPosition += transform.forward * speed * Time.deltaTime;
		}
	}
}