#pragma strict

class EditorPlane extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Private vars
	var material : Material;	
	var buttons : List.< Button > = new List.< Button > ();
	
	var vertexList : Vector3[,] = new Vector3 [ 100, 100 ];;
	
	var size : float = 4.0;
	var mesh : Mesh;
	var vertices : Vector3[];
	var uv : Vector2[];
	var triangles : int[];
	
	// Private classes
	private class Button {
		var obj : GameObject;
		var btn : OGButton;
		var vertex : Vector3;
		
		function Create ( vert : Vector3 ) {
			vertex = vert;
			
			obj = new GameObject ();
			btn = obj.AddComponent ( OGButton );
			
			btn.pivot.x = OGWidget.RelativeX.Center;
			btn.pivot.y = OGWidget.RelativeY.Center;
			
			obj.transform.parent = OGRoot.currentPage.transform;
			obj.transform.localScale = new Vector3 ( 20, 20, 1 );
		}
		
		function Update ( pos : Vector3 ) {
			var newVertex : Vector3 = pos + vertex;
			newVertex = Camera.main.WorldToScreenPoint ( newVertex );
			newVertex = new Vector3 ( newVertex.x, Screen.height - newVertex.y, newVertex.z );
			obj.transform.localPosition = newVertex;
		}	
	}
	
	private class VertexButton extends Button {
		function VertexButton ( vert : Vector3, index : int ) {
			Create ( vert );
			
			obj.name = "VertexButton" + index;
			
			vertex = vert;
			btn.text = index.ToString();
		}
	}
	
	private class PlusButton extends Button {
		var a : Vector3;
		var b : Vector3;
		
		function PlusButton ( v1 : Vector3, v2 : Vector3 ) {
			a = v1;
			b = v2;
			
			Create ( (v1/2) + (v2/2) );
		
			obj.name = "PlusButton";
			btn.text = "+";
			btn.transform.localScale = new Vector3 ( 30, 30, 0 );
		}
	}
	
	private class MinusButton extends Button {
		var a : Vector3;
		var b : Vector3;
		var c : Vector3;
		var d : Vector3;
		
		function MinusButton ( v1 : Vector3, v2 : Vector3, v3 : Vector3, v4 : Vector3 ) {
			a = v1;
			b = v2;
			c = v3;
			d = v4;
			
			Create ( (v1/4) + (v2/4) + (v3/4) + (v4/4) );
		
			obj.name = "MinusButton";
			btn.text = "-";
			btn.transform.localScale = new Vector3 ( 40, 40, 0 );
		}
	}
	
	
	////////////////////
	// Transform functions
	////////////////////
	// Grab
	function GrabVertex ( vert : Vector3 ) {
		Debug.Log ( "Vertex grabbed: " + vert );
	}
	
	// Plus
	function PlusPlane ( a : Vector3, b : Vector3 ) {
		
		
		Debug.Log ( "Plus: " + a + " | " + b );
	}
	
	// Minus
	function MinusPlane ( a : Vector3, b : Vector3, c : Vector3, d : Vector3 ) {
		Debug.Log ( "Minus: " + a + " | " + b  + " | " + c  + " | " + d );
	}
	
	////////////////////
	// Core functions
	////////////////////
	// Add plane
	function AddPlane () {
		vertexList[0,0] = new Vector3 ( 0, 0, 0 );
		vertexList[1,0] = new Vector3 ( size, 0, 0 );
		vertexList[1,1] = new Vector3 ( size, 0, size );
		vertexList[0,1] = new Vector3 ( 0, 0, size );
	    
	    vertices = [
	    	vertexList[0,0],
	    	vertexList[1,0],
	    	vertexList[1,1],
	    	vertexList[0,1]
	    ];
	    
	    uv = [
	    	Vector2 ( 0, 0 ),
	    	Vector2 ( 1, 0 ),
	    	Vector2 ( 1, 1 ),
	    	Vector2 ( 0, 1 )
	    ];
		
		triangles = [
			0, 3, 2,
			2, 1, 0
		];
	}
	
	// Clear all buttons
	function ClearButtons () {
		for ( b in buttons ) {
			Destroy ( b.obj );
		}
		
		buttons.Clear();
	}
	
	// Create all buttons
	function CreateButtons () {
		ClearButtons ();
		
		var i : int;
		var vertices : Vector3[] = this.GetComponent(MeshFilter).mesh.vertices;
		var minusCounter : int = 0;
		
		for ( i = 0; i < vertices.Length; i++ ) {
			// Vertex buttons
			var vb : VertexButton = new VertexButton ( vertices[i], i );
			vb.btn.func = function () { GrabVertex ( vb.vertex ); };
			buttons.Add ( vb );	
		
			// Plus buttons
			var pb : PlusButton;		
			if ( i == vertices.Length - 1 ) {
				pb = new PlusButton ( vertices[i], vertices[0] );
			} else {
				pb = new PlusButton ( vertices[i], vertices[i+1] );
			}
			pb.btn.func = function () { PlusPlane ( pb.a, pb.b ); };
			buttons.Add ( pb );
					
			// Minus buttons
			if ( minusCounter == 3 ) {
				minusCounter = 0;
				var mb : MinusButton = new MinusButton ( vertices[i-3], vertices[i-2], vertices[i-1], vertices[i] );
				mb.btn.func = function () { MinusPlane ( mb.a, mb.b, mb.c, mb.d ); };
				buttons.Add ( mb );
			} else {
				minusCounter++;
			}
		}
		
	}
	
	// Init
	function Start () {
		material = Resources.Load ( "Materials/Editor/editor_checker" ) as Material;
		
		mesh = new Mesh ();
	    
		AddPlane (); 
	    
	    mesh.name = "Plane";
	    mesh.vertices = vertices;
	    mesh.uv = uv;
	    mesh.triangles = triangles;
	    
	    this.GetComponent(MeshFilter).mesh = mesh;
   	 	this.GetComponent(MeshCollider).mesh = mesh;
    	this.GetComponent(MeshRenderer).material = material;
	    
	    this.GetComponent(MeshFilter).mesh = mesh;
	    this.GetComponent(MeshCollider).mesh = mesh;
	    this.GetComponent(MeshRenderer).material = material;
	    
		this.transform.position = EditorCore.GetSpawnPosition();
		this.transform.parent = EditorCore.currentLevel.transform;
	}
	
	// Update
	function Update () {
		var b : Button;
		
		if ( EditorCore.GetSelectedObject() == this.gameObject ) {
			if ( buttons.Count == 0 ) {
				CreateButtons ();
			} else {
				for ( b in buttons ) {
					b.Update ( this.transform.position );
				}
			}
		} else if ( buttons.Count > 0 ) {
			ClearButtons ();
			
		}
		
		if ( this.GetComponent(MeshFilter).mesh.vertices.Length <= 0 ) {
			Destroy ( this.gameObject );
		}
	}
}