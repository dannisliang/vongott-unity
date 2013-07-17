#pragma strict

import UnityEngine;
import System.Collections;

class AStarMap {
	var nodes : AStarNode[,,];
	var width : int;
	var height : int;
	
	function GetNode ( x : int, y : int, z : int ) : AStarNode {
		return nodes [ x, y, z ];
			
	}
	
	function GetNode ( position : Vector3 ) : AStarNode {
		for ( var node : AStarNode in nodes ) {
			if ( node.position == position ) {
				return node;
			}
		}
		
		return null;
	}
	
	function GetIndex ( node : AStarNode ) : Vector3 {
		for ( var x = 0; x < nodes.GetLength(0); x++ ) {
			for ( var y = 0; y < nodes.GetLength(1); y++ ) {
				for ( var z = 0; z < nodes.GetLength(2); z++ ) {
					if ( nodes[x,y,z] == node ) {
						return new Vector3 ( x, y, z );
					}
				}
			}
		}
		
		return Vector3.zero;
	}
	
	function GetNeighbors ( node : AStarNode, goal : AStarNode, neighbors : ArrayList ) {
		return;
	}
	
	function Reset () {
		for ( var n : AStarNode in nodes ) {
			n.parent = null;
		}
	}
}

public class AStarGridMap extends AStarMap {	
	function AStarGridMap ( start : Vector3, size : Vector3 ) {
		nodes = new AStarNode [ size.x, size.y, size.z ];
		var counter : int = 0;
		
		for ( var x = 0; x < size.x; x++ ) {
			for ( var y = 0; y < size.y; y++ ) {
				for ( var z = 0; z < size.z; z++ ) {
					var m : AStarNode = new AStarNode ( start.x + x, start.y + y, start.z + z );
					nodes [ x, y, z ] = m;
					counter++;
				}
			}
		}
	}
	
	override function GetNeighbors ( node : AStarNode, goal : AStarNode, neighbors : ArrayList ) {
		var index : Vector3 = GetIndex ( node );
		
		var neighborPositions : Vector3[] = [
			new Vector3 ( index.x-1,index.y,index.z ),		// left
			new Vector3 ( index.x+1,index.y,index.z ),		// right
			new Vector3 ( index.x,index.y+1,index.z ),		// up
			new Vector3 ( index.x,index.y-1,index.z ),		// down	
			new Vector3 ( index.x,index.y,index.z+1 ),		// front	
			new Vector3 ( index.x,index.y,index.z-1 )		// back		
		];
		
		
		for ( var pos : Vector3 in neighborPositions ) {			
			if ( ( pos.x >= 0 && pos.x < nodes.GetLength(0) ) && ( pos.y >= 0 && pos.y < nodes.GetLength(1) ) && ( pos.z >= 0 && pos.z < nodes.GetLength(2) ) ) {
				var n : AStarNode = nodes [ pos.x, pos.y, pos.z ];
					
				if ( n.walkable ) {
					neighbors.Add ( n );
				}
			}
		}
	}
}