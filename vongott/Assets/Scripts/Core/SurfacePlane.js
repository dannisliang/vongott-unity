#pragma strict

class SurfacePlane {
	var vertices : Vector3[];
	var index : Vector2 = new Vector2();
	var position : Vector3 = new Vector3();
	
	function SurfacePlane ( v : Vector3[] ) {
		vertices = v;
	}
}