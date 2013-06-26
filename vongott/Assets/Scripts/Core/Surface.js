#pragma strict

class Surface extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var material : Material;	
	var materialPath : String = "Materials/Editor/editor_checker";
	var materialSize : float = 1.0;
	var buttons : List.< Button > = new List.< Button > ();
	var planes : List.< SurfacePlane > = new List.< SurfacePlane> ();
	
	static var size : float = 4.0;
	var mesh : Mesh;
	
	// Private classes
	private class Button {
		var obj : GameObject;
		var btn : OGButton;
		var giz : EditorVertexGizmo;
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
			if ( obj && !giz ) {
				var newVertex : Vector3 = pos + vertex;
				newVertex = Camera.main.WorldToScreenPoint ( newVertex );
				newVertex = new Vector3 ( newVertex.x, Screen.height - newVertex.y, newVertex.z );
				obj.transform.localPosition = newVertex;
			}
		}	
	}
	
	private class VertexButton extends Button {
		function VertexButton ( surface : Transform, pos : Vector3 ) {
			obj = Instantiate ( Resources.Load ( "Prefabs/Editor/vertex_gizmo" ) );
			giz = obj.GetComponent ( EditorVertexGizmo );
			
			obj.name = "VertexGizmo";
			obj.transform.parent = surface;
			obj.transform.localPosition = pos;
		}
	}
	
	private class PlusButton extends Button {
		var a : Vector3;
		var b : Vector3;
		
		function PlusButton ( a : Vector3, b : Vector3 ) {
			Create ( (a/2) + (b/2) );
		
			obj.name = "PlusButton";
			btn.text = "+";
		}
	}
	
	private class MinusButton extends Button {
		function MinusButton ( a : Vector3, b : Vector3, c : Vector3, d : Vector3 ) {
			Create ( (a/4) + (b/4) + (c/4) + (d/4) );
		
			obj.name = "MinusButton";
			btn.text = "-";
		}
	}
	
	
	////////////////////
	// Transform functions
	////////////////////
	// Plus
	function PlusPlane ( plane : SurfacePlane, dir : Vector3 ) {
		var x : Vector3 = Vector3 ( size, 0, 0 );
		var y : Vector3 = Vector3 ( 0, 0, size );
		
		if ( dir == Vector3.left ) {
			AddPlane ( [
				plane.vertices[0] - x,
				plane.vertices[0],
				plane.vertices[3],
				plane.vertices[3] - x
			] );
		} else if ( dir == Vector3.right ) {
			AddPlane ( [
				plane.vertices[1],
				plane.vertices[1] + x,
				plane.vertices[2] + x,
				plane.vertices[2]
			] );
		} else if ( dir == Vector3.forward ) {
			AddPlane ( [
				plane.vertices[3],
				plane.vertices[2],
				plane.vertices[2] + y,
				plane.vertices[3] + y
			] );
		} else if ( dir == Vector3.back ) {
			AddPlane ( [
				plane.vertices[0] - y,
				plane.vertices[1] - y,
				plane.vertices[1],
				plane.vertices[0]
			] );
		}
	}
	
	// Minus
	function MinusPlane ( plane : SurfacePlane ) {
		planes.Remove ( plane );
		Apply();
	}
	
	
	////////////////////
	// Conversions
	////////////////////
	// Flip surface
	function FlipNormals () {
		var normals : Vector3[] = mesh.normals;
		for ( var i = 0; i < normals.Length; i++ ) {
			normals[i] = -normals[i];
		}
			
		mesh.normals = normals;

		for ( var m = 0; m < mesh.subMeshCount; m++ ) {
			var triangles : int[] = mesh.GetTriangles(m);
			for ( var x = 0; x < triangles.Length; x += 3 ) {
				var temp : int = triangles[x + 0];
				triangles[x + 0] = triangles[x + 1];
				triangles[x + 1] = temp;
			}
			
			mesh.SetTriangles(triangles, m);
		}		
	}
	
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
		
				
		// UVs
		// ^ temporary list
		var tempUVs : List.< Vector2 > = new List.< Vector2 >();
		
		// ^ add uvs from every plane
		for ( i = 0; i < planes.Count; i++ ) {
			for ( var u : Vector3 in planes[i].vertices ) {
				tempUVs.Add ( new Vector2 ( u.x * materialSize, u.z * materialSize ) );
			}
		}
		
		// ^ convert the temporary list back into a built-in array
		mesh.uv = UVsToArray ( tempUVs );
		
		// Triangles
		// ^ temporary list
		var tempTriangles : List.< int > = new  List.< int >();
		
		// ^ add triangles from every plane
		for ( i = 0; i < planes.Count; i++ ) {
			tempTriangles.Add ( System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[0] ) );
			tempTriangles.Add ( System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[3] ) );
			tempTriangles.Add ( System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[2] ) );
				
			tempTriangles.Add ( System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[2] ) );
			tempTriangles.Add ( System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[1] ) );
			tempTriangles.Add ( System.Array.LastIndexOf ( mesh.vertices, planes[i].vertices[0] ) );
		}
		
		// ^ convert the temporary list back into a built-in array
		mesh.triangles = TrianglesToArray ( tempTriangles );
		
		// Redo buttons
		CreateButtons ();
		
		// Recalculate
		mesh.RecalculateNormals();
		mesh.RecalculateBounds();
		mesh.Optimize();
		
		// Reapply collider
		this.GetComponent(MeshCollider).enabled = false;
		this.GetComponent(MeshCollider).enabled = true;
	}
	
	// Add plane
	function AddPlane ( vertices : Vector3[] ) {
		var plane : SurfacePlane = new SurfacePlane ( vertices );
  		
  		planes.Add ( plane );
	
		Apply ();
	}
	
	// Clear all buttons
	function ClearButtons () {
		for ( var b : Button in buttons ) {
			Destroy ( b.obj );
		}
		
		buttons.Clear();
	}
	
	// Create all buttons
	function CreateButtons () {
		if ( Application.loadedLevel != 1 || EditorCore.GetSelectedObject() != this.gameObject ) { return; }
		
		if ( !EditorCore.editMeshMode ) {
			ClearButtons ();
			return;
		}
		
		for ( var plane : SurfacePlane in planes ) {
			// Vertex buttons
			for ( var vertex : Vector3 in plane.vertices ) {
				var vb : VertexButton = new VertexButton ( this.transform, vertex );
				vb.giz.surface = this;
				vb.giz.plane = plane;
				vb.giz.vertex = System.Array.LastIndexOf ( plane.vertices, vertex );
				buttons.Add ( vb );
			}
			
			// Plus buttons
			for ( var direction : Vector3 in [ Vector3.left, Vector3.right, Vector3.forward, Vector3.back ] ) {
				var pb : PlusButton;
				
				var a : Vector3;
				var b : Vector3;
				
				if ( direction == Vector3.left ) {
					a = plane.vertices[0];
					b = plane.vertices[3];
				} else if ( direction == Vector3.right ) {
					a = plane.vertices[1];
					b = plane.vertices[2];
				} else if ( direction == Vector3.back) {
					a = plane.vertices[0];
					b = plane.vertices[1];
				} else if ( direction == Vector3.forward ) {
					a = plane.vertices[2];
					b = plane.vertices[3];
				}
				
				pb = new PlusButton	( a, b );
				pb.btn.func = function () { PlusPlane ( plane, direction ); };
				buttons.Add ( pb );
			}
					
			// Minus buttons
			var mb : MinusButton = new MinusButton ( plane.vertices[0], plane.vertices[1], plane.vertices[2], plane.vertices[3] );
			mb.btn.func = function () { MinusPlane ( plane ); };
			buttons.Add ( mb );
		}
		
	}
	
	// Init
	function ReloadMaterial () {
		material = Resources.Load ( materialPath ) as Material;
		this.GetComponent(MeshRenderer).material = material;
	}
	
	function Init () {
		mesh = new Mesh ();
		mesh.name = "Surface";
	   	    
	    this.GetComponent(MeshFilter).mesh = mesh;
   	 	this.GetComponent(MeshCollider).mesh = mesh;
		 
	    if ( material == null ) {
			ReloadMaterial ();
		}
	}
	
	function FirstPlane () {
		Init ();
		
		AddPlane ( [ 
			Vector3(0,0,0),
			Vector3(size,0,0),
			Vector3(size,0,size),
			Vector3(0,0,size)
		] );
	}
	
	function Start () {
		if ( planes.Count == 0 ) {
	    	FirstPlane ();
	    }
	    
	}
	
	// Update
	function Update () {
		var b : Button;
		
		if ( EditorCore.GetSelectedObject() == this.gameObject ) {
			if ( buttons.Count > 0 ) {
				if ( !EditorCore.editMeshMode ) {
					ClearButtons ();
				}
				
				for ( b in buttons ) {
					b.Update ( this.transform.position );
				}
			
			} else if ( EditorCore.editMeshMode ) {
				CreateButtons ();
			
			}
			
		} else {
			if ( this.GetComponent(MeshRenderer).material.color != Color.white ) {
				this.GetComponent(MeshRenderer).material.color = Color.white;
			}
		}
		
		/*if ( this.GetComponent(MeshFilter).mesh.vertices.Length <= 0 ) {
			Destroy ( this.gameObject );
		}*/
	}
}