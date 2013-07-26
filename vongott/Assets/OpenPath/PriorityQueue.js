#pragma strict

class PriorityQueue implements IComparer {
	var nodes : ArrayList;
	
	function PriorityQueue() {
		nodes = new ArrayList();
	}
	
	function GetAllNodes () : ArrayList {
		return nodes;
	}
		
	function GetLength () : int {
		return nodes.Count;
	}
	
	function Compare ( nodeA : AStarNode, nodeB : AStarNode ) : int { 
        if ( nodeA.estimatedTotalCost < nodeB.estimatedTotalCost) {
			return -1;
		} else if ( nodeA.estimatedTotalCost > nodeB.estimatedTotalCost ) {
			return 1;
		} else {
			return 0;
    	}
    }
	
	function Push ( node : AStarNode ) : int {
		nodes.Add ( node );
		nodes.Sort();
		return nodes.Count;
	}
	
	function Front () : AStarNode {
		if ( nodes.Count > 0 ) {
			return nodes[0] as AStarNode;
		} else {
			return null;
		}
	}
	
	function Pop () : AStarNode {
		if ( nodes.Count == 0 ) {
			return null;
		}
		
		var mn : AStarNode = nodes[0] as AStarNode;
		nodes.RemoveAt ( 0 );
		
		return mn;
	}
	
	function Contains ( node : System.Object ) : boolean {
		return nodes.Contains ( node );
	}
	
	function Remove ( node : AStarNode ) {
		nodes.Remove ( node );	
		nodes.Sort();
	}
}