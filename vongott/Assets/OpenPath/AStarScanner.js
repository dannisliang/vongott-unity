#pragma strict

class AStarScanner extends MonoBehaviour {
	var gridSize : Vector3;
	var mapType : AStarMap.AStarMapType;
	var map : AStarMap = null;
	var heuristic : float = 10.0;
	var spacing : float = 1.0;
	var bounds : Bounds;
	
	function GetBounds () {
	    var bounds : Bounds = new Bounds ( Vector3.zero, Vector3.zero );
	    var pos : Vector3 = Vector3.zero;
	    
	    for ( var r : Renderer in FindObjectsOfType ( Renderer ) ) {
	    	bounds.Encapsulate ( r.bounds );
	    }
	    
	    pos = bounds.min;
	    
	    transform.position = pos;
		gridSize = new Vector3 ( Mathf.Round ( bounds.size.x / spacing ) + 1, Mathf.Round ( bounds.size.y / spacing ) + 1, Mathf.Round ( bounds.size.z / spacing ) + 1 );
	}
	
	function SetMap () {
		if ( mapType == AStarMap.AStarMapType.Grid ) {
			map = new AStarGridMap ( transform.position, gridSize, spacing );
		} else {
			var meshes : List.<Mesh> = new List.<Mesh>();
			
			for ( var mf : MeshFilter in GameObject.FindObjectsOfType(MeshFilter) ) {
				if ( mf.gameObject.tag == "walkable" ) {
					meshes.Add ( mf.sharedMesh );
				}
			}
		
			map = new AStarWaypointMap ( meshes, spacing );
		}
	}
	
	function Init () {
		GetBounds ();
		SetMap ();
	}
	
	function Start () {
		Init ();
	}
	
	function FindPath ( start : Vector3, goal : Vector3 ) : List.<AStarNode> {
		var here : AStarNode = GetClosestNode ( start );
		var there : AStarNode = GetClosestNode ( goal );
		var list : List.<AStarNode> = AStar.Search ( here, there, map, heuristic );
	
		map.Reset ();
	
		return list;
	}
	
	function OnDrawGizmos () {
		if ( map == null ) { return; }
		if ( map.nodes == null ) { return; }
		
		if ( bounds != null ) {
			Gizmos.color = Color.white;
		
			Gizmos.DrawWireCube ( bounds.center, bounds.size );
		}
		
		for ( var n : AStarNode in map.nodes ) {		
			if ( n == null ) { continue; }
						
			Gizmos.color = new Color ( 1, 1, 1, 0.5 );
			if ( n.parent ) { Gizmos.color = Color.red; }
			if ( n.active ) { Gizmos.color = Color.green; }

			Gizmos.DrawCube ( n.position, new Vector3 ( 0.1, 0.1, 0.1 ) );
			
			Gizmos.color = Color.white;
		}
	}
	
	function GetClosestNode ( pos : Vector3 ) : AStarNode {
		var shortestDistance : float = 100;
		var node : AStarNode;
		
		for ( var n : AStarNode in map.nodes ) {
			if ( n == null ) { continue; }
			
			var currentDistance : float = ( pos - (n as AStarNode).position ).magnitude;
			
			if ( currentDistance < shortestDistance ) {
				shortestDistance = currentDistance;
				node = n as AStarNode;
				
			}
		}
		
		return node;
	}
}