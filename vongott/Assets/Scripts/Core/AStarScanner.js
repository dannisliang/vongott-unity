#pragma strict

class AStarScanner extends MonoBehaviour {
	var gridSize : Vector3;
	var map : AStarMap;
	var heuristic : float = 10.0;
	
	function Start () {
		map = new AStarGridMap ( transform.position, gridSize );
		
		SetFlags ();
	}
	
	function CheckWalkable ( colliders : Collider[] ) : boolean {
		for ( var c : Collider in colliders ) {
			if ( c.transform.tag != "walkable" ) { return false; }
		}
		
		return true;
	}
	
	function SetFlags () {
		for ( var n : AStarNode in map.nodes ) {
			var colliders : Collider[] = Physics.OverlapSphere ( n.position, 1.0, 9 );
			
			if ( colliders.Length > 0 ) {
				n.walkable = CheckWalkable ( colliders );
			} else {
				n.inactive = true;
				n = null;
			}
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
			if ( n.walkable ) { Gizmos.color = Color.green; }
			else if ( n.inactive ) { continue; }
			else { Gizmos.color = Color.red; }
			
			Gizmos.DrawCube ( n.position, new Vector3 ( 0.5, 0.5, 0.5 ) );
			
			Gizmos.color = Color.white;
		}
	}
	
	function GetClosestNode ( obj : Transform ) : AStarNode {
		var shortestDistance : float = 100;
		var node : AStarNode;
		
		for ( var n : AStarNode in map.nodes ) {
			var currentDistance : float = ( obj.position - (n as AStarNode).position ).magnitude;
			
			if ( currentDistance < shortestDistance ) {
				shortestDistance = currentDistance;
				node = n as AStarNode;
				
			}
		}
		
		return node;
	}
}