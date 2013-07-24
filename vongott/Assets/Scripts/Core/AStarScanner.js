#pragma strict

class AStarScanner extends MonoBehaviour {
	var gridSize : Vector3;
	var map : AStarMap;
	var heuristic : float = 10.0;
	var spacing : float = 1.0;
	
	function GetBounds () {
	    var b : Bounds = new Bounds ( Vector3.zero, Vector3.zero );
	    var pos : Vector3 = Vector3.zero;
	    
	    for ( var r : Renderer in FindObjectsOfType ( Renderer ) ) {
	    	b.Encapsulate ( r.bounds );
	    }
	    
	    pos = b.min;
	    
	    transform.position = pos;
		gridSize = new Vector3 ( Mathf.Round ( b.size.x / spacing ), Mathf.Round ( b.size.y / spacing ), Mathf.Round ( b.size.z / spacing ) );
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
	
	function CheckPrefab ( obj : GameObject, path : String ) : boolean {
		if ( obj.GetComponent ( Prefab ) ) {
			return obj.GetComponent ( Prefab ).path == path;
		} else {
			return false;
		}
	}
	
	function FindPath ( start : AStarNode, goal : AStarNode ) : ArrayList {
		var nodes : ArrayList = AStar.Search ( start, goal, map, heuristic );
	
		for ( var i = 0; i < nodes.Count-1; i++ ) {
			Debug.DrawLine ( (nodes[i] as AStarNode).position, (nodes[i+1] as AStarNode).position );
		}
	}
	
	function OnDrawGizmos () {
		if ( map == null ) { return; }
		if ( map.nodes == null ) { return; }
		
		for ( var n : AStarNode in map.nodes ) {
			if ( n == null ) { continue; }
			
			Gizmos.color = Color.green;

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