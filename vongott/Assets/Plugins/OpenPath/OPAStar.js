#pragma strict

class OPAStar {
	// Lists
	private static var openList : OPPriorityQueue;
	private static var closedList : OPPriorityQueue;
			
	// Find a path and return a list of each step
	public static function Search ( start : OPNode, goal : OPNode, map : OPMap, heuristicWeight : float ) : OPNode[] {
		if ( start == null || goal == null ) {
			Debug.LogError ( "OPAStar | Either target or goal unspecified. Perhaps the scanner has not been initialised?" );
			return;
		}
		
		// Add the starting node to the open list
		openList = new OPPriorityQueue ();
		openList.Push ( start );
		start.costSoFar = 0;
		start.estimatedTotalCost = HeuristicEstimate ( start, goal, heuristicWeight );
		
		closedList = new OPPriorityQueue ();
		
		var currentNode : OPNode = null;
		
		// While the open list is not empty
		while ( openList.GetLength() != 0 ) {
			// Current node = node from the open list with the lowest cost
			currentNode = openList.Front();
			
			if ( currentNode == goal ) {
				break;
			}
			
			// Examine each node adjacent to the current node
			var neighbors : List.<OPNode>;
		        
			neighbors = map.GetNeighbors ( currentNode );

			for ( var nIndex = 0; nIndex != neighbors.Count; nIndex++ ) {		
				// Get the cost estimate for the end node
				var endNode : OPNode = neighbors[nIndex] as OPNode;
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
			// Return the empty array			
			return new OPNode[0];
		
		} else {
			// Path complete			
			return GetPath ( currentNode );

		}
	}
	
	private static function HeuristicEstimate ( currNode : OPNode, goal : OPNode, heuristicWeight : float ) : float {
		return ( currNode.position - goal.position ).magnitude * heuristicWeight;
	}
	
	private static function GetCost ( node0 : OPNode, node1 : OPNode ) : float {
		return ( node0.position - node1.position ).magnitude;
	}
		
	// Helper function used to build path for AStar search
	private static function GetPath ( node : OPNode ) : OPNode[] {
		var path : List.<OPNode> = new List.<OPNode> ();
		
		// Traverse the path from goal to start
		var counter : int = 0;
		
		while ( node != null ) {
			if ( counter > 100 ) {
				Debug.LogError ( "OpenPath | Screech! Failsafe engaged." );
				path = null;
				return new OPNode [0];
			};
			
			path.Add  ( node );
			node = node.parent;
			counter++;
		}
		
		// Reverse it
		path.Reverse();
		
		// Remove the first node (as we don't want the OPPathFinder to return to it by accident)
		if ( path.Count > 0 ) {
			path.RemoveAt ( 0 );
		}

		return path.ToArray();
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
