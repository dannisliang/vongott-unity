#pragma strict

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
	
	function GetNeighbors ( node : AStarNode, goal : AStarNode, neighbors : List.<AStarNode> ) {
		return;
	}
	
	function Reset () {
		for ( var n : AStarNode in nodes ) {
			if ( n ) {
				n.parent = null;
			}
		}
	}
}

public class AStarGridMap extends AStarMap {	
	function AStarGridMap ( start : Vector3, size : Vector3, spacing : float ) {
		nodes = new AStarNode [ size.x, size.y, size.z ];
		
		for ( var x = 0; x < size.x; x++ ) {
			for ( var z = 0; z < size.z; z++ ) {
				var from : Vector3 = new Vector3 ( start.x + (x*spacing), start.y + (size.y*spacing), start.z + (z*spacing) );
				var hits : RaycastHit[] = Physics.RaycastAll ( from, Vector3.down, Mathf.Infinity );
				
				for ( var h : RaycastHit in hits ) {										
					var p : Vector3 = h.point; 
					if ( CheckWalkable ( p, spacing ) && h.collider.gameObject.tag != "dynamic" ) {
						var m : AStarNode = new AStarNode ( p.x, p.y, p.z );
						var i : Vector3 = Round ( start, p, spacing );
						nodes [ i.x, i.y, i.z ] = m;
					}
				}
			}
		}
	}
	
	// Check walkable
	function CheckWalkable ( position : Vector3, spacing : float ) : boolean {
		var hit : RaycastHit;
		
		// Down
		var colliders : Collider[] = Physics.OverlapSphere ( position, spacing/4, 9 );
		
		if ( colliders.Length > 0 ) {
			for ( var c : Collider in colliders ) {
				if ( c.transform.tag != "walkable" && c.transform.tag != "dynamic" ) {
					return false;
				}
			}
			
			return true;
			
		} else {
			return false;
		
		}
	}
	
	// Round value
	function Round ( start : Vector3, val : Vector3, factor : float ) : Vector3 {
		val.x = Mathf.Round ( ( Mathf.Abs ( start.x ) + val.x ) / factor );
		val.y = Mathf.Round ( ( Mathf.Abs ( start.y ) + val.y ) / factor );
		val.z = Mathf.Round ( ( Mathf.Abs ( start.z ) + val.z ) / factor );
		
		return val;
	}
	
	override function GetNeighbors ( node : AStarNode, goal : AStarNode, neighbors : List.<AStarNode> ) {
		var index : Vector3 = GetIndex ( node );
		
		var neighborPositions : Vector3[] = [
			new Vector3 ( index.x,index.y,index.z+1 ),		// front
			new Vector3 ( index.x,index.y+1,index.z+1 ),	// front up
			new Vector3 ( index.x,index.y-1,index.z+1 ),	// front down
			new Vector3 ( index.x-1,index.y,index.z+1 ),	// front left
			new Vector3 ( index.x+1,index.y,index.z+1 ),	// front right
			
			new Vector3 ( index.x-1,index.y,index.z ),		// left
			new Vector3 ( index.x-1,index.y+1,index.z ),	// left up
			new Vector3 ( index.x-1,index.y-1,index.z ),	// left down
			
			new Vector3 ( index.x+1,index.y,index.z ),		// right
			new Vector3 ( index.x+1,index.y+1,index.z ),	// right up
			new Vector3 ( index.x+1,index.y-1,index.z ),	// right down
			
			new Vector3 ( index.x,index.y+1,index.z ),		// up
			
			new Vector3 ( index.x,index.y-1,index.z ),		// down
						
			new Vector3 ( index.x,index.y,index.z-1 ),		// back
			new Vector3 ( index.x,index.y+1,index.z-1 ),	// back up
			new Vector3 ( index.x,index.y-1,index.z-1 ),	// back down
			new Vector3 ( index.x-1,index.y,index.z-1 ),	// back left
			new Vector3 ( index.x+1,index.y,index.z-1 )		// back right
		];
		
		
		for ( var pos : Vector3 in neighborPositions ) {			
			if ( ( pos.x >= 0 && pos.x < nodes.GetLength(0) ) && ( pos.y >= 0 && pos.y < nodes.GetLength(1) ) && ( pos.z >= 0 && pos.z < nodes.GetLength(2) ) ) {
				var n : AStarNode = nodes [ pos.x, pos.y, pos.z ];
					
				if ( n != null ) {
					neighbors.Add ( n );
				}
			}
		}
	}
}