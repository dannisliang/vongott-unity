#pragma strict

import System.Collections;
import System.Collections.Generic;

class Dijkstra {
	static function Run ( source : GameObject, target : GameObject ) : Stack.< GameObject >  {
		if ( source != null && target != null ) {
			var dist : Dictionary.< GameObject, float > = new Dictionary.< GameObject, float > ();
			var previous : Dictionary.< GameObject, GameObject > = new Dictionary.< GameObject, GameObject > ();
			var q : List.< GameObject > = new List.< GameObject > ();
			var nodeGraph : List.< GameObject > = new List.< GameObject > ();
			
			nodeGraph.Add ( source );
			
			for ( var i = 0; i < nodeGraph.Count; i++ ) {
				for ( var node : GameObject in nodeGraph[i].GetComponent(DijkstraPathNode).neighbors ) {
					if ( !nodeGraph.Contains ( node ) ) {
						nodeGraph.Add ( node );
					}
				}
			}
			
			for ( var v : GameObject in nodeGraph ) {
				dist[v] = Mathf.Infinity;
				previous[v] = null;
				q.Add ( v );
			}
			
			dist[source] = 0;
			
			while ( q.Count > 0 ) {
				var shortestDistance : float = Mathf.Infinity;
				var shortestDistanceNode : GameObject = null;
				for ( var obj : GameObject in q ) {
					if ( dist[obj] < shortestDistance ) {
						shortestDistance = dist[obj];
						shortestDistanceNode = obj;
					}
				}
				
				var u : GameObject = shortestDistanceNode;
				
				q.Remove ( u );
				
				if ( u == target ) {
					var s : Stack.< GameObject > = new Stack.< GameObject >();
					
					while ( previous[u] != null ) {
						s.Push ( u );
						u = previous[u];
					}
					
					return s;
				}
				
				if ( dist[u] == Mathf.Infinity ) {
					break;
				}
				
				for ( var v : GameObject in u.GetComponent(DijkstraPathNode).neighbors ) {
					var alt : float = dist[u] + ( u.transform.position - v.transform.position ).magnitude;
				
					if ( alt < dist[v] ) {
						dist[v] = alt;
						previous[v] = u;
					}
				}
			}
		}
		
		return null;
		
	}
}