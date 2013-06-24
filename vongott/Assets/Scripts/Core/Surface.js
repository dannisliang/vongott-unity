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
		}
		
		function Update ( indexes : int[] ) {
			uv = new Vector2[vertices.Length];
			
			for ( var i = 0; i < vertices.Length; i++ ) {
				uv[i] = new Vector2 ( vertices[i].x, vertices[i].z );
			}
			
			triangles = [
				indexes[0], indexes[3], indexes[2],
				indexes[2], indexes[1], indexes[0]
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
		}
	}
	
	private class MinusButton extends Button {
		function MinusButton ( pos : Vector3 ) {
			Create ( pos + Vector3 ( (size/2), 0, (size/2) ) );
		
			obj.name = "MinusButton";
			btn.text = "-";
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
		if ( dir == Vector3.left ) {
			AddPlane ( plane.index.x - 1, plane.index.y );
		} else if ( dir == Vector3.right ) {
			AddPlane ( plane.index.x + 1, plane.index.y );
		} else if ( dir == Vector3.forward ) {
			AddPlane ( plane.index.x, plane.index.y + 1 );
		} else if ( dir == Vector3.back ) {
			AddPlane ( plane.index.x, plane.index.y - 1 );
		}
	}
	
	// Minus
	function MinusPlane ( plane : SurfacePlane ) {

	}
	
	
	////////////////////
	// Conversions
	////////////////////
	// Vertices to array
	function VerticesToArray ( list : List.< Vector3 > ) : Vector3[] {
		var verts : Vector3[] = new Vector3[list.Count];
		
		for ( var i = 0; i < list.Count; i++ ) {
			verts[i] = list[i];
		}
		
		return verts;
	}
	
	// UVs to array
	function UVsToArray ( list : List.< Vector2 > ) : Vector2[] {
		var uvs : Vector2[] = new Vector2[list.Count];
		
		for ( var i = 0; i < list.Count; i++ ) {
			uvs[i] = list[i];
		}
		
		return uvs;
	}
	
	// Triangles to array
	function TrianglesToArray ( list : List.< int > ) : int[] {
		var triangles : int[] = new int[list.Count];
		
		for ( var i = 0; i < list.Count; i++ ) {
			triangles[i] = list[i];
		}
		
		return triangles;
	}
	
	
	////////////////////
	// Core functions
	////////////////////
	// Apply
	function Apply () {
		var i : int = 0;
		
		// Vertices
		// ^ temporary list
		var tempVertices : List.< Vector3 > = new List.< Vector3 >();
		
		// ^ add vertices from every plane
		for ( i = 0; i < planes.Count; i++ ) {
			for ( var v : Vector3 in planes[i].vertices ) {
				tempVertices.Add ( v );
			}
		}
		
		// ^ convert the temporary list back into a built-in array
		mesh.vertices = VerticesToArray ( tempVertices );
		
		// Update all planes with new indexes
		for ( i = 0; i < planes.Count; i++ ) {
			planes[i].Update ( [
				System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[0] ),
				System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[1] ),
				System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[2] ),
				System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[3] )
			] );
		}
				
		// UVs
		// ^ temporary list
		var tempUVs : List.< Vector2 > = new List.< Vector2 >();
		
		// ^ add uvs from every plane
		for ( i = 0; i < planes.Count; i++ ) {
			for ( var u : Vector2 in planes[i].uv ) {
				tempUVs.Add ( u );
			}
		}
		
		// ^ convert the temporary list back into a built-in array
		mesh.uv = UVsToArray ( tempUVs );
		
		// Triangles
		// ^ temporary list
		var tempTriangles : List.< int > = new  List.< int >();
		
		// ^ add triangles from every plane
		for ( i = 0; i < planes.Count; i++ ) {
			for ( var t : int in planes[i].triangles ) {
				tempTriangles.Add ( t );
			}
		}
		
		// ^ convert the temporary list back into a built-in array
		mesh.triangles = TrianglesToArray ( tempTriangles );
		
		// Redo buttons
		CreateButtons ();
		
		// Reapply collider
		this.GetComponent(MeshFilter).mesh = mesh;
   	 	this.GetComponent(MeshCollider).mesh = mesh;
	}
	
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
		if ( vertices[0] == Vector3.zero ) { vertices[0] = new Vector3 ( xPos, 0, yPos ); }
		if ( vertices[1] == Vector3.zero ) { vertices[1] = new Vector3 ( xPos + size, 0, yPos ); }
		if ( vertices[2] == Vector3.zero ) { vertices[2] = new Vector3 ( xPos + size, 0, yPos + size ); }
		if ( vertices[3] == Vector3.zero ) { vertices[3] = new Vector3 ( xPos, 0, yPos + size ); }
		
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
  		
  		planes.Add ( plane );
	
		Apply ();
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