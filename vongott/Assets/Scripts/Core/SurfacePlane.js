#pragma strict

class SurfacePlane {
	var vertices : Vector3[];
	var uv : Vector2[];
	var triangles : int[];
	var index : Vector2 = new Vector2();
	var position : Vector3 = new Vector3();
	var materialSize : float;
	
	function SurfacePlane ( v : Vector3[] ) {
		vertices = v;
	}
	
	function Update ( indexes : int[] ) {
		uv = new Vector2[vertices.Length];
		
		for ( var i = 0; i < vertices.Length; i++ ) {
			uv[i] = new Vector2 ( vertices[i].x / materialSize, vertices[i].z / materialSize );
		}
		
		triangles = [
			indexes[0], indexes[3], indexes[2],
			indexes[2], indexes[1], indexes[0]
		];
	}
}