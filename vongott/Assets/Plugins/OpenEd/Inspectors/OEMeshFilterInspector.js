#pragma strict

public class OEMeshFilterInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( MeshFilter ); }
	
	override function Inspector () {
		var meshFilter : MeshFilter = target.GetComponent.< MeshFilter > ();

		meshFilter.mesh = AssetLinkField ( "Mesh", "mesh", target, typeof ( Mesh ), "obj" ) as Mesh;
	}	
}
