#pragma strict

class AStarPathFinder extends MonoBehaviour {
	var currentNode : int = 0;
	var scanner : AStarScanner;
	var speed : float = 4.0;
	
	@HideInInspector var nodes : List.<AStarNode> = new List.<AStarNode>();
	@HideInInspector var goal : Transform;
	
	function ClearNodes () {
		for ( var node : AStarNode in nodes ) {
			node.active = false;
			node.parent = null;
		}
		
		nodes.Clear ();	
	}
	
	function SetGoal ( t : Transform ) {
		ClearNodes ();
		goal = t;
		
		// If there is a goal, create the nodes
		if ( goal ) {
			UpdatePosition ();
		}
	}
	
	function UpdatePosition () {		
		var here : AStarNode = scanner.GetClosestNode ( this.transform );
		var there : AStarNode = scanner.GetClosestNode ( goal );
	
		//Loom.RunAsync ( function () {
			var newNodes : List.<AStarNode> = AStar.Search ( here, there, scanner.map, scanner.heuristic );
									
			for ( var node : AStarNode in newNodes ) {
				node.active = true;
			}
			
			//Loom.QueueOnMainThread ( function () {
				nodes = newNodes;
				currentNode = 0;
			//} );
		//} );
	}
	
	function Update () {
		if ( scanner == null ) { Debug.LogError ( "No scanner found! Attach an AStarScanner to the scanner variable." ); return; }
			
		// If there are nodes to follow
		if ( nodes && nodes.Count > 0 ) {
			if ( ( transform.position - ( nodes[currentNode] as AStarNode ).position ).magnitude < 1.0 && currentNode < nodes.Count - 1 ) {
				currentNode++;
			}
			
			var lookPos : Vector3 = ( nodes[currentNode] as AStarNode ).position - transform.position;
			lookPos.y = 0;
			
			transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), 8 * Time.deltaTime );			
			transform.localPosition += transform.forward * speed * Time.deltaTime;
		}
	}
}