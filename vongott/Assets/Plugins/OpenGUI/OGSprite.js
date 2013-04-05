@script ExecuteInEditMode()

class OGSprite extends OGWidget {
	// Menu items
	var atlas : OGAtlas;
	var texture : Texture2D;
	var updateSprite = false;
	
	// Create plane
	function CreatePlane () {
		var m : Mesh = new Mesh ();
		m.name = "Sprite Mesh";
		m.vertices = [Vector3(0, 0, 0),Vector3(1, 0, 0), Vector3(1, 1, 0), Vector3(0, 1, 0)];
		m.uv = [Vector2(0,0), Vector2(0,1), Vector2(1,1), Vector2(1,0)];
		m.triangles = [0, 1, 2, 0, 2, 3];
		m.RecalculateNormals();
		
		/*var mf : MeshFilter = self.AddComponent(MeshFilter);
		var r : MeshRenderer = self.AddComponent(MeshRenderer);
		r.material = new Material();
		mf.mesh = m;*/
	}
	
	function UpdateSprite () {
		/*if ( !self.GetComponent(MeshFilter) ) {
			CreatePlane ();
		}
		
		if ( texture && !self.GetComponent(MeshRenderer) ) {
			self.GetComponent(MeshRenderer).material.SetTexture ( texture.ToString(), texture );
		}*/
	}
	
	function Update () {
		if ( updateSprite ) {
			UpdateWidget();
			UpdateSprite();
			
			updateSprite = false;
		}
	}
	
	function Start () {
	}
}