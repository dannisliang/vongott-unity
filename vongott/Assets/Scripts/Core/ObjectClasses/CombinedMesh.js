#pragma strict

@script RequireComponent (MeshFilter)
@script RequireComponent (MeshRenderer)
@script RequireComponent (MeshCollider)

class CombinedMesh extends MonoBehaviour {
	function Start () {
		if ( !this.GetComponent(MeshFilter) ) {
			this.gameObject.AddComponent(MeshFilter);
		}
		
		if ( !this.GetComponent(MeshRenderer) ) {
			this.gameObject.AddComponent(MeshRenderer);
		}
		
		if ( !this.GetComponent(MeshCollider) ) {
			this.gameObject.AddComponent(MeshCollider);
		}
	}
	
	private function FixUV ( mesh : Mesh, scale : Vector3 ) {
		for ( var uv : Vector2 in mesh.uv ) {
		}
	}
	
	private function ScaleMesh ( mesh : Mesh, scale : Vector3 ) : Mesh {
		var newMesh : Mesh = new Mesh();
		newMesh.subMeshCount = mesh.subMeshCount;
		newMesh.vertices = mesh.vertices;
		newMesh.triangles = mesh.triangles;
		newMesh.uv = mesh.uv;
		
		var vertices : Vector3[] = newMesh.vertices;
		
		for ( var p : int = 0; p < vertices.Length; p++ ) {
			vertices[p].x *= scale.x;
			vertices[p].y *= scale.y;
			vertices[p].z *= scale.z;
		}
		
		FixUV ( newMesh, scale );
		
		newMesh.vertices = vertices;
		newMesh.RecalculateNormals();
		
		return newMesh;
	}
	
	public function Union ( shape : Shape ) {
		
	}
	
	public function Add ( meshAdded : Mesh, transformAdded : Transform, material : Material ) {
		var meshBefore : Mesh = this.GetComponent(MeshFilter).mesh;
		
		if ( !meshBefore ) {
			meshBefore = new Mesh();
		
		}
		
		var combine : CombineInstance[] = new CombineInstance[2];
		combine[0].mesh = meshBefore;
		combine[0].transform = this.transform.localToWorldMatrix;
		combine[1].mesh = ScaleMesh ( meshAdded, transformAdded.localScale );
		combine[1].transform = transformAdded.localToWorldMatrix;
		
		var newMesh : Mesh = new Mesh();
		newMesh.name = "CombinedMesh";
		
		this.GetComponent(MeshFilter).mesh = newMesh;
		this.GetComponent(MeshFilter).mesh.CombineMeshes(combine);
	
		this.GetComponent(MeshRenderer).materials[0] = material;
		
		UpdateCollider ();
	}
	
	public function UpdateCollider () {
		this.GetComponent(MeshCollider).sharedMesh = this.GetComponent(MeshFilter).sharedMesh;
	}
	
	public function Subtract ( mesh : Mesh ) {
	
	}
	
}