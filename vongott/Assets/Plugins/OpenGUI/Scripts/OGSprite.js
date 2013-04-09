@script ExecuteInEditMode()

class OGSprite extends OGWidget {
	// Menu items
	var atlas : OGAtlas;
	var texture : Texture2D;
	var updateSprite = false;
		
	// Create plane
	function CreatePlane () {
		var o = this.gameObject;
		
		var m : Mesh = new Mesh();
		m.name = "OGSprite_Mesh";
		m.vertices = [Vector3(-1, -1, 0.01), Vector3(1, -1, 0.01), Vector3(1, 1, 0.01), Vector3(-1, 1, 0.01) ];
		m.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];
		m.triangles = [0, 1, 2, 0, 2, 3];
		m.RecalculateNormals();
		
		o.name = "OGSprite";
		var mr = o.AddComponent(MeshRenderer);
		var mf = o.AddComponent(MeshFilter);
		
		mf.mesh = m;
		o.transform.localScale = new Vector3 ( 100.0, 100.0, 0.0 );
	}
	
	function UpdateSprite () {
		
	}
	
	function Update () {
		if ( updateSprite ) {
			UpdateWidget();
			UpdateSprite();
			
			updateSprite = false;
		}	
	}
	
	function Start () {
		CreatePlane ();
	}
}