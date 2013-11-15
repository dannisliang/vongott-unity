#pragma strict

import System.Collections.Generic;

class AStarNavMesh extends MonoBehaviour {	
	private class Triangle {
		var vertices : Vector3[];
		var node : AStarNode;
		
		function Triangle ( v0 : Vector3, v1 : Vector3, v2 : Vector3 ) {
			vertices = new Vector3[3];
			vertices[0] = v0;
			vertices[1] = v1;
			vertices[2] = v2;
		}
		
		private function IsNeighborTo ( t : Triangle ) : boolean {
			var similarVertices : int = 0;
			
			for ( var thisVertex : Vector3 in vertices ) {
				for ( var thatVertex : Vector3 in t.vertices ) {
					if ( thisVertex == thatVertex ) {
						similarVertices++;
					}
				}
			}
			
			return similarVertices > 1;
		}
		
		public function FindNeighbors ( triangles : Triangle[] ) {
			var tempList : List.< AStarNode > = new List.< AStarNode > ();
			
			for ( var t : Triangle in triangles ) {
				if ( IsNeighborTo ( t ) ) {
					tempList.Add ( t.node );
				}
			}
			
			node.neighbors = tempList.ToArray();
		}
		
		public function GetMedianPoint () : Vector3 {
			var result : Vector3;
			
			for ( var i : int = 0; i < vertices.Length; i++ ) {
				result += vertices[i];
			}
			
			result /= vertices.Length;
		
			return result;
		}
	}
	
	public function GetNodes () : List.< AStarNode > {
		var mesh : Mesh = this.GetComponent(MeshFilter).mesh;
		var triangleList : List.< Triangle > = new List.< Triangle > ();
		var triangleArray : Triangle[];
		var newNodes : List.< AStarNode > = new List.< AStarNode > ();
		
		// Create triangles
		for ( var i : int = 0; i < mesh.triangles.Length; i += 3 ) {
			var triangle : Triangle = new Triangle (
				this.transform.TransformPoint ( mesh.vertices [ mesh.triangles [ i ] ] ),
				this.transform.TransformPoint ( mesh.vertices [ mesh.triangles [ i + 1 ] ] ),
				this.transform.TransformPoint ( mesh.vertices [ mesh.triangles [ i + 2 ] ] )
			);
			
			var node : AStarNode = new AStarNode ();
			node.position = triangle.GetMedianPoint ();
		
			triangle.node = node;
			
			triangleList.Add ( triangle );
		}
		
		triangleArray = triangleList.ToArray();
				
		for ( var t : Triangle in triangleArray ) {
			t.FindNeighbors ( triangleArray );
			newNodes.Add ( t.node );
		}
		
		return newNodes;
	}
}