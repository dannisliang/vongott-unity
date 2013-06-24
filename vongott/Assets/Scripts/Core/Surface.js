#pragma strict

class Surface extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Private vars
	var material : Material;	
	var buttons : List.< Button > = new List.< Button > ();
	
	var planes : List.< SurfacePlane > = new List.< SurfacePlane> ();
	
	static var size : float = 4.0;
	var mesh : Mesh;
	
	// Private classes
	private class SurfacePlane {
		var vertices : Vector3[];
		var uv : Vector2[];
		var triangles : int[];
		var index : Vector2 = new Vector2();
		var position : Vector3 = new Vector3();
		
		function SurfacePlane ( v : Vector3[] ) {
			vertices = v;
			
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
	}
	
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
		
		function PlusButton ( center : Vector3, direction : Vector3 ) {
			Create ( center + Vector3 ( (size/2), 0, (size/2) ) + ( direction * (size/2) ) );
		
			obj.name = "PlusButton";
			btn.text = "+";
			btn.transform.localScale = new Vector3 ( 30, 30, 0 );
		}
	}
	
	private class MinusButton extends Button {
		function MinusButton ( pos : Vector3 ) {
			Create ( pos + Vector3 ( (size/2), 0, (size/2) ) );
		
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
	function PlusPlane ( plane : SurfacePlane, dir : Vector3 ) {

	}
	
	// Minus
	function MinusPlane ( plane : SurfacePlane ) {

	}
	
	////////////////////
	// Core functions
	////////////////////
	// Add plane
	function AddPlane ( x : int, y : int ) {
		var xPos : float = x * size;
		var yPos : float = y * size;
		var vertices : Vector3[] = new Vector3[4];
		
		// Check for neighbours
		for ( var p : SurfacePlane in planes ) {
			// Left
			if ( p.index.x == x - 1 && p.index.y == y ) {
				vertices[0] = p.vertices[1];
				vertices[3] = p.vertices[2];
			}
			
			// Right
			if ( p.index.x == x + 1 && p.index.y == y ) {
				vertices[1] = p.vertices[0];
				vertices[2] = p.vertices[3];
			}
			
			// Forward
			if ( p.index.x == x && p.index.y == y + 1 ) {
				vertices[0] = p.vertices[3];
				vertices[1] = p.vertices[2];
			}
			
			// Back
			if ( p.index.x == x && p.index.y == y - 1 ) {
				vertices[3] = p.vertices[0];
				vertices[2] = p.vertices[1];
			}
		}
		
		// Fill necessary vertices
		if ( vertices[0] == null ) { vertices[0] = new Vector3 ( xPos, 0, yPos ); }
		if ( vertices[1] == null ) { vertices[0] = new Vector3 ( xPos + size, 0, yPos ); }
		if ( vertices[2] == null ) { vertices[0] = new Vector3 ( xPos + size, 0, yPos + size ); }
		if ( vertices[3] == null ) { vertices[0] = new Vector3 ( xPos, 0, yPos + size ); }
		
		var plane : SurfacePlane = new SurfacePlane ( [
			vertices[0],
			vertices[1],
			vertices[2],
			vertices[3]
		] );
	    
  		plane.index.x = x;
  		plane.index.y = y;
  		
  		plane.position.x = xPos;
  		plane.position.y = 0;
  		plane.position.z = yPos;
  		
  		mesh.vertices = plane.vertices;
  		mesh.triangles = plane.triangles;
  		mesh.uv = plane.uv;
  		
  		planes.Add ( plane );
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
		
		for ( var plane : SurfacePlane in planes ) {
			// Vertex buttons
			for ( var vertex : Vector3 in plane.vertices ) {
				var vb : VertexButton = new VertexButton ( vertex, System.Array.LastIndexOf ( mesh.vertices, vertex ) );
				vb.btn.func = function () { GrabVertex ( vb.vertex ); };
				buttons.Add ( vb );	
			}
		
			// Plus buttons
			for ( var direction : Vector3 in [ Vector3.left, Vector3.right, Vector3.forward, Vector3.back ] ) {
				var pb : PlusButton = new PlusButton ( plane.position, direction );		
				pb.btn.func = function () { PlusPlane ( plane, direction ); };
				buttons.Add ( pb );
			}
					
			// Minus buttons
			var mb : MinusButton = new MinusButton ( plane.position );
			mb.btn.func = function () { MinusPlane ( plane ); };
			buttons.Add ( mb );
		}
		
	}
	
	// Init
	function Start () {
		material = Resources.Load ( "Materials/Editor/editor_checker" ) as Material;
		
		mesh = new Mesh ();
	    
		AddPlane ( 50, 50 ); 
	    
	    mesh.name = "Surface";
	    
	    this.GetComponent(MeshFilter).mesh = mesh;
   	 	this.GetComponent(MeshCollider).mesh = mesh;
    	this.GetComponent(MeshRenderer).material = material;
	    
	    this.GetComponent(MeshFilter).mesh = mesh;
	    this.GetComponent(MeshCollider).mesh = mesh;
	    this.GetComponent(MeshRenderer).material = material;
	    
		this.transform.position = EditorCore.GetSpawnPosition() + Vector3( -50 * size, 0, -50 * size );
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
		
		/*if ( this.GetComponent(MeshFilter).mesh.vertices.Length <= 0 ) {
			Destroy ( this.gameObject );
		}*/
	}
}