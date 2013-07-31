#pragma strict

class AStar {
	// Lists
	static var openList : PriorityQueue;
	static var closedList : PriorityQueue;
	
	// Find a path and return a list of each step
	static function Search ( start : AStarNode, goal : AStarNode, map : AStarMap, heuristicWeight : float ) : List.<AStarNode> {
		// Add the starting node to the open list
		openList = new PriorityQueue ();
		openList.Push ( start );
		start.costSoFar = 0;
		start.estimatedTotalCost = HeuristicEstimate ( start, goal, heuristicWeight );
		
		closedList = new PriorityQueue ();
		
		var currentNode : AStarNode = null;
		
		// While the open list is not empty
		while ( openList.GetLength() != 0 ) {
			// Current node = node from the open list with the lowest cost
			currentNode = openList.Front();
			
			if ( currentNode == goal ) {
				break;
			}
			
			// Examine each node adjacent to the current node
			var neighbors : List.<AStarNode> = new List.<AStarNode> ();
			map.GetNeighbors ( currentNode, goal, neighbors );
						
			for ( var nIndex = 0; nIndex != neighbors.Count; nIndex++ ) {		
				// Get the cost estimate for the end node
				var endNode : AStarNode = neighbors[nIndex] as AStarNode;
				var incrementalCost : float = GetCost ( currentNode, endNode );
				var endNodeCost : float = currentNode.costSoFar + incrementalCost;
				
				// If the node is closed we may have to skip or remove it from the closed list.
				if ( closedList.Contains ( endNode ) ) {
					// If we didn't find a shorter route, skip.
					if ( endNode.costSoFar <= endNodeCost ) {
						continue;
					}
					
					// Otherwise remove it from the closed list
					closedList.Remove( endNode );

				// Skip if the node is open and we haven't found a better route
				} else if ( openList.Contains ( endNode ) ) {
					// If our route is no better, then skip
					if(endNode.costSoFar <= endNodeCost ) {
						continue;
					}
				}
				
				var endNodeHeuristic : float = HeuristicEstimate ( endNode, goal, heuristicWeight );
				// We are here if we need to update the node
				// Update the cost and estimate
				endNode.costSoFar = endNodeCost;
				endNode.parent = currentNode;
				endNode.estimatedTotalCost = endNodeCost + endNodeHeuristic;
				
				// And add it to the open list
				if ( !openList.Contains ( endNode ) ) {
					openList.Push(endNode);
				}
			}
			
			// We've finished looking at the neighbors for the current node, so add it to the closed list and remove it from the open list
			closedList.Push ( currentNode );
			openList.Remove ( currentNode );
			
		}
		
		if ( !currentNode.Equals ( goal ) ) {
			Debug.LogError ( "OpenPath | Path not found!" );
			// Return the empty array
			return new List.<AStarNode>();
		
		} else {
			// Path complete
			return GetPath ( currentNode );

		}
	}
	
	private static function HeuristicEstimate ( currNode : AStarNode, goal : AStarNode, heuristicWeight : float ) : float {
		return ( currNode.position - goal.position ).magnitude * heuristicWeight;
	}
	
	private static function GetCost ( node0 : AStarNode, node1 : AStarNode ) : float {
		return ( node0.position - node1.position ).magnitude;
	}
		
	// Helper function used to build path for AStar search
	private static function GetPath ( node : AStarNode ) : List.<AStarNode> {
		var path : List.<AStarNode> = new List.<AStarNode> ();
		
		// Traverse the path from goal to start
		while ( node != null ) {
			path.Add  ( node );
			node = node.parent;
		}
		
		// Reverse it
		path.Reverse();
		return path;
	}
	
	// Get straight line distance between two points
	public static function EuclideanDistance ( point1 : Vector3, point2 : Vector3 ) : float {
		return ( point1 - point2 ).magnitude;
	}
	
	// Get manhattan distance between two points
	public static function ManhattanDistance ( point1 : Vector3, point2 : Vector3 ) : float {
		return Mathf.Abs ( point1.x - point2.x ) + Mathf.Abs ( point1.y - point2.y ) + Mathf.Abs ( point1.z - point2.z );
	}
}