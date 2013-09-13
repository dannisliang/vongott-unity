#pragma strict

class AStarPathFinder extends MonoBehaviour {
	var currentNode : int = 0;
	var scanner : AStarScanner;
	var speed : float = 4.0;
	var stoppingDistance : float = 0.1;
	var nodeDistance : float = 1.0;
	var autoChase : boolean = false;
	
	@HideInInspector var nodes : List.<AStarNode> = new List.<AStarNode>();
	@HideInInspector var goal : Vector3;
	
	function ClearNodes () {
		for ( var node : AStarNode in nodes ) {
			node.active = false;
			node.parent = null;
		}
		
		nodes.Clear ();	
	}
	
	function SetGoal ( t : Transform ) {
		ClearNodes ();
		
		// If there is a goal, create the nodes
		if ( t ) {
			goal = t.position;
			UpdatePosition ();
		}
	}
	
	function SetGoal ( v : Vector3 ) {
		ClearNodes ();
		goal = v;
		UpdatePosition ();
	}
	
	function GetGoal () : Vector3 {
		return goal;
	}
		
	function UpdatePosition () {
		var start : Vector3 = this.transform.position;
					
		Loom.RunAsync ( function () {
			var newNodes : List.<AStarNode> = scanner.FindPath ( start, goal );
									
			for ( var node : AStarNode in newNodes ) {
				node.active = true;
			}
			
			Loom.QueueOnMainThread ( function () {
				nodes = newNodes;
				currentNode = 0;
			} );
		} );
	}
	
	function Update () {
		if ( scanner == null ) {
			if ( GameObject.FindObjectOfType(AStarScanner) ) {
				scanner = GameObject.FindObjectOfType(AStarScanner);
			} else {
				Debug.LogError ( "No scanner found! Attach an AStarScanner to the scanner variable." );
				return;
			}
		}
			
		// If there are nodes to follow
		if ( nodes && nodes.Count > 0 ) {
			if ( ( transform.position - ( nodes[currentNode] as AStarNode ).position ).magnitude < nodeDistance && currentNode < nodes.Count - 1 ) {
				currentNode++;
			}
			
			if ( autoChase ) {
				var lookPos : Vector3 = ( nodes[currentNode] as AStarNode ).position - transform.position;
				lookPos.y = 0;
				
				transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), 8 * Time.deltaTime );			
				transform.localPosition += transform.forward * speed * Time.deltaTime;
			}
		
			if ( ( transform.position - goal ).magnitude < stoppingDistance ) {
				ClearNodes ();
			}
		}
	}
}