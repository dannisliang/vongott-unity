#pragma strict

class EditorPlane extends MonoBehaviour {
	var defaultMaterial : Material;	
	var buttons : List.< OGButton > = new List.< OGButton > ();
	
	var mesh : Mesh;
	var vertices : Vector3[];
	var uv : Vector2[];
	var triangles : int[];
	
	function CreateVertexButton ( pos : Vector3 ) {
		var obj : GameObject = new GameObject ( "VertexButton" );
		var btn : OGButton = obj.AddComponent ( OGButton );
		
		btn.text = buttons.Count.ToString();
		
		btn.pivot.x = OGWidget.RelativeX.Center;
		btn.pivot.y = OGWidget.RelativeY.Center;
				
		obj.transform.parent = OGRoot.currentPage.transform;
		obj.transform.localScale = new Vector3 ( 20, 20, 1 );
		obj.transform.localPosition = Camera.main.WorldToScreenPoint ( this.transform.position + pos );
		
		buttons.Add ( btn );
	}
	
	function CreateButtons () {
		for ( var vertex : Vector3 in this.GetComponent(MeshFilter).mesh.vertices ) {
			CreateVertexButton ( vertex );	
		}
	}
	
	function Start () {
		defaultMaterial = Resources.Load ( "Materials/Editor/editor_checker" ) as Material;
		
		var size : float = 4.0;
	    
	    mesh = new Mesh ();
	     
	    vertices = [
	    	Vector3 ( 0, 0, 0 ),
	    	Vector3 ( size, 0, 0 ),
	    	Vector3 ( size, 0, size ),
	    	Vector3 ( 0, 0, size )
	    ];
	    
	    uv = [
	    	Vector2 ( 0, 0 ),
	    	Vector2 ( 1, 0 ),
	    	Vector2 ( 1, 1 ),
	    	Vector2 ( 0, 1 )    	
	    ];
		
		triangles = [
			0,
			3,
			2,
			2,
			1,
			0
		]; 
	    
	    mesh.name = "Plane";
	    mesh.vertices = vertices;
	    mesh.uv = uv;
	    mesh.triangles = triangles;
	    
	    this.GetComponent(MeshFilter).mesh = mesh;
   	 	this.GetComponent(MeshCollider).mesh = mesh;
    	this.GetComponent(MeshRenderer).material = defaultMaterial;
	    
	    this.GetComponent(MeshFilter).mesh = mesh;
	    this.GetComponent(MeshCollider).mesh = mesh;
	    this.GetComponent(MeshRenderer).material = defaultMaterial;
	    
		this.transform.position = EditorCore.GetSpawnPosition();
		this.transform.parent = EditorCore.currentLevel.transform;
	}
	
	function Update () {
		if ( EditorCore.GetSelectedObject() == this.gameObject ) {
			if ( buttons.Count == 0 ) {
				CreateButtons ();
			} else {
				for ( var i = 0; i < buttons.Count; i++ ) {
					var newVertex : Vector3 = this.transform.position + this.GetComponent(MeshFilter).mesh.vertices[i];
					newVertex = Camera.main.WorldToScreenPoint ( newVertex );
					newVertex = new Vector3 ( newVertex.x, Screen.height - newVertex.y, newVertex.z );
					
					buttons[i].transform.localPosition = newVertex;
				}
			}
		} else if ( buttons.Count > 0 ) {
			for ( var btn : OGButton in buttons ) {
				Destroy ( btn.gameObject );
			}
			
			buttons.Clear();
			
		}
	}
}