#pragma strict

class AStarScanner extends MonoBehaviour {
	var gridSize : Vector3;
	var map : AStarMap;
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
		map = new AStarGridMap ( transform.position, gridSize, spacing );
	}
	
	function Init () {
		GetBounds ();
		SetMap ();
	}
	
	function Start () {
		Init ();
	}
	
	function FindPath ( start : AStarNode, goal : AStarNode ) {
		var nodes : List.<AStarNode> = AStar.Search ( start, goal, map, heuristic );
	
		for ( var i = 0; i < nodes.Count-1; i++ ) {
			Debug.DrawLine ( (nodes[i] as AStarNode).position, (nodes[i+1] as AStarNode).position );
		}
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
			else if ( n.active ) { Gizmos.color = Color.green; }
			else { Gizmos.color = new Color ( 1, 1, 1, 0.5 ); }

			Gizmos.DrawCube ( n.position, new Vector3 ( 0.5, 0.5, 0.5 ) );
			
			Gizmos.color = Color.white;
		}
	}
	
	function GetClosestNode ( obj : Transform ) : AStarNode {
		var shortestDistance : float = 100;
		var node : AStarNode;
		
		for ( var n : AStarNode in map.nodes ) {
			if ( n == null ) { continue; }
			
			var currentDistance : float = ( obj.position - (n as AStarNode).position ).magnitude;
			
			if ( currentDistance < shortestDistance ) {
				shortestDistance = currentDistance;
				node = n as AStarNode;
				
			}
		}
		
		return node;
	}
}