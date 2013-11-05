#pragma strict

@script RequireComponent (MeshFilter)
@script RequireComponent (MeshRenderer)
@script RequireComponent (MeshCollider)
@script RequireComponent (BooleanRT);

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
		
		if ( !this.GetComponent(BooleanRT) ) {
			this.gameObject.AddComponent(BooleanRT);
		}
		
		this.GetComponent(MeshFilter).mesh = new Mesh ();
	}
	
	private function FixUV ( obj : Transform ) {
		var mesh : Mesh = obj.GetComponent(MeshFilter).mesh;
		var scale : Vector3 = obj.localScale;
		var uvs : Vector2[] = mesh.uv;
	
		for ( var uv : Vector2 in uvs ) {
			uv.x = uv.x * scale.x;
			uv.y = uv.y * scale.y;
		}
		
		mesh.uv = uvs;
		obj.GetComponent(MeshFilter).mesh = mesh;
	}
		
	public function Add ( objAdded : GameObject, materialAdded : Material ) {
		var objBefore : GameObject = this.gameObject;
		var materials : Material[] = this.renderer.materials;
		var nrt : BooleanRT = this.GetComponent(BooleanRT);		
		var tmpMtl : Material = objAdded.renderer.material;

		nrt.recalCollider = true;
        nrt.recalculateNormals = true;
        nrt.type = BooleanRTLib.BooleanType.Union;
        
        nrt.obj1 = objBefore.transform;
        nrt.obj2 = objAdded.transform;
        
        nrt.obj2.renderer.material = materialAdded;
        FixUV ( nrt.obj2 );
        
		nrt.ExecuteNow ();
		
		objAdded.renderer.material = tmpMtl;
	}
	
	public function UpdateCollider () {
		this.GetComponent(MeshCollider).sharedMesh = this.GetComponent(MeshFilter).sharedMesh;
	}
	
}