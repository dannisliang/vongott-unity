#pragma strict

class AStarPathFinder extends MonoBehaviour {
	var target : Transform;
	var searching : boolean = false;
	var nodes : ArrayList;
	var currentNode : int = 0;
	var scanner : AStarScanner;
	var speed : float = 4.0;
	
	function Update () {
		if ( scanner == null && GameCore.started ) { scanner = GameCore.scanner; }
	
		if ( target && !searching && scanner ) {
			searching = true;

			var start : AStarNode = scanner.GetClosestNode ( this.transform );
			var goal : AStarNode = scanner.GetClosestNode ( target );
			nodes = AStar.Search ( start, goal, scanner.map, scanner.heuristic );
				
			return;
		}
	
		if ( nodes && searching && nodes.Count > 0 ) {
			if ( ( transform.position - ( nodes[currentNode] as AStarNode ).position ).magnitude < 1.0 && currentNode < nodes.Count - 1 ) {
				currentNode++;
			}
			
			var lookPos : Vector3 = ( nodes[currentNode] as AStarNode ).position - transform.position;
			lookPos.y = 0;
			
			transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), 8 * Time.deltaTime );			
			transform.localPosition += transform.forward * speed * Time.deltaTime;
			
			for ( var i = 0; i < nodes.Count - 1; i++ ) {
				Debug.DrawLine ( (nodes[i] as AStarNode).position, (nodes[i+1] as AStarNode).position, Color.cyan );
			}
		}
	}
}