#pragma strict

class EditorVertexButton extends MonoBehaviour {
	var surface : Surface;
	var plane : SurfacePlane;
	var vertex : int;
		
	function Remodel () {
		plane.vertices[vertex] = this.transform.position - surface.transform.position;
		surface.UpdateButtons ();
		surface.Apply ();
	}
	
	function Update () {
		if ( EditorCore.GetSelectedObject() == this.gameObject ) {
			if ( surface && plane ) {
				Remodel();
			}
		}
	}
}