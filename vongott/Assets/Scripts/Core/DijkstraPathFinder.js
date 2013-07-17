#pragma strict

import System.Collections;
import System.Collections.Generic;

class DijkstraPathFinder extends MonoBehaviour {
	var target : Transform;
	var speed : float = 3.0;
	var keepDistance : float = 5.0;
	var sphereCastRadius : float = 0.5;
	var turningDistance : float = 3.0;
			
	function Update () {
		if ( !target ) { return; }
		
		var hit : RaycastHit;
		
		Physics.SphereCast ( transform.position, sphereCastRadius, target.position - transform.position, hit );
		
		if ( hit != null && hit.collider.tag == "Player" ) {
			Debug.DrawLine ( transform.position, target.position, Color.green );
			
			transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( target.position - transform.position ), turningDistance * Time.deltaTime );
		
			if ( ( target.position - transform.position ).magnitude > keepDistance ) {
				transform.localPosition += transform.forward * speed * Time.deltaTime;
			}	
			
			gameObject.GetComponent ( DijkstraCurrentNode ).currentNode = null;
			
		} else {
			var path : Stack.<GameObject> = Dijkstra.Run ( gameObject.GetComponent(DijkstraCurrentNode).currentNode, target.gameObject.GetComponent(DijkstraCurrentNode).currentNode );
			
			if ( path != null && path.Count > 0 ) {			
				var goal : GameObject = path.Pop ();
				transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( goal.transform.position - transform.position ), turningDistance * Time.deltaTime );
	
				transform.localPosition += transform.forward * speed * Time.deltaTime;
			}
		}
	}
	
}