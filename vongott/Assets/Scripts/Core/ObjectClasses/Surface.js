#pragma strict

@script RequireComponent(GUID)

class Surface extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////	
	var material : Material;	
	var materialPath : String = "Materials/Editor/editor_checker";
	var materialSize : float = 1.0;
	
	var foliagePath : String = "";
	var foliageDensity : float = 1.0;
	
	var buttons : List.< Button > = new List.< Button > ();
	var planes : List.< SurfacePlane > = new List.< SurfacePlane> ();
	
	static var size : float = 4.0;
	var mesh : Mesh;
	
	// Private classes
	private class Button {
		var obj : GameObject;
		var vertex : Vector3;
		var surface : Surface;
		var vertIndex : int;
		var plane : SurfacePlane;
		
		function Update () {}
	}
	
	private class VertexButton extends Button {
		var btn : EditorVertexButton;
		
		function VertexButton ( s : Surface, p : SurfacePlane, i : int ) {
			obj = Instantiate ( Resources.Load ( "Prefabs/Editor/handle_corner" ) as GameObject );
			btn = obj.GetComponent ( EditorVertexButton );
			
			surface = s;
			plane = p;
			
			btn.surface = surface;
			btn.plane = plane;
			btn.vertex = i;
			
			vertIndex = i;
			
			obj.name = "VertexButton" + i;
			obj.transform.parent = surface.transform;
			obj.transform.localPosition = plane.vertices[i];
		
			Update ();
		}
	
		override function Update () {			
			if ( EditorCore.GetSelectedObject() != obj ) {
				obj.transform.localPosition = plane.vertices[vertIndex] + (plane.middle - plane.vertices[vertIndex]).normalized * 0.2;
			}
			
			obj.transform.LookAt ( Camera.main.transform );
		}
	}
	
	private class PlusButton extends Button {
		var a : int;
		var b : int;
		var btn : OGButton3D;
		
		function PlusButton ( p : SurfacePlane, pA : int, pB : int, surface : Transform ) {
			plane = p;
			
			a = pA;
			b = pB;
			
			obj = Instantiate ( Resources.Load ( "Prefabs/Editor/handle_add" ) as GameObject );
			btn = obj.GetComponent ( OGButton3D );
			
			obj.name = "PlusButton";
			obj.transform.parent = surface;
			obj.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
		
			Update ();
		}
		
		override function Update () {
			obj.transform.localPosition = (plane.vertices[a]/2) + (plane.vertices[b]/2);
			obj.transform.LookAt ( Camera.main.transform );
		}
	}
	
	private class MinusButton extends Button {
		var a : Vector3;
		var b : Vector3;
		var c : Vector3;
		var d : Vector3;
		var btn : OGButton3D;
		
		function MinusButton ( p : SurfacePlane, surface : Transform ) {
			obj = Instantiate ( Resources.Load ( "Prefabs/Editor/handle_delete" ) as GameObject );
			btn = obj.GetComponent ( OGButton3D );
		
			plane = p;
		
			obj.name = "MinusButton";
			obj.transform.parent = surface;
			obj.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
		
			Update ();
		}
		
		override function Update () {
			a = plane.vertices[0];
			b = plane.vertices[1];
			c = plane.vertices[2];
			d = plane.vertices[3];
			
			obj.transform.localPosition = (a/4) + (b/4) + (c/4) + (d/4);
			obj.transform.LookAt ( Camera.main.transform );
			
			plane.middle = obj.transform.position;
		}
	}
	
	
	////////////////////
	// Transform functions
	////////////////////
	// Plus
	function PlusPlane ( plane : SurfacePlane, a : int, b : int ) {
		var c : int;
		var d : int;
		
		// Find the other 2 vertices
		if ( a == 0 && b == 1 ) { c = 2; d = 3; }
		else if ( a == 1 && b == 2 ) { c = 3; d = 0; }
		else if ( a == 2 && b == 3 ) { c = 0; d = 1; }
		else if ( a == 3 && b == 0 ) { c = 1; d = 2; }
		
		// Create new vertices from distance
		var v0 : Vector3 = plane.vertices[a] + (plane.vertices[a]-plane.vertices[d]);
		var v1 : Vector3 = plane.vertices[b] + (plane.vertices[b]-plane.vertices[c]);
		var v2 : Vector3 = plane.vertices[b];
		var v3 : Vector3 = plane.vertices[a];
						
		// Add the plane
		AddPlane ( [ v0, v1, v2, v3 ] );
		
		// Apply changes
		Apply();
		CreateButtons ();
		
		// Reselect object
		EditorCore.SelectObject ( this.gameObject );
	}
	
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
		
		Apply();
		CreateButtons ();
		
		// Reselect object
		EditorCore.SelectObject ( this.gameObject );
	}
	
	// Minus
	function MinusPlane ( plane : SurfacePlane ) {
		planes.Remove ( plane );
		
		Apply();
		CreateButtons ();
		
		// Reselect object
		EditorCore.SelectObject ( this.gameObject );
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
		
		mesh = new Mesh();
		
		// Vertices
		// ^ temporary list
		var tempVertices : List.< Vector3 > = new List.< Vector3 >();
		
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
				var x : float = u.x;
				var y : float = u.z;
						
				tempUVs.Add ( new Vector2 ( x * materialSize, y * materialSize ) );
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
		
		// Recalculate
		mesh.RecalculateNormals();
		mesh.RecalculateBounds();
		mesh.Optimize();
		
		// Reapply collider
		this.GetComponent(MeshCollider).enabled = false;
		this.GetComponent(MeshCollider).enabled = true;
		
		// Reapply mesh
		this.GetComponent(MeshFilter).sharedMesh = mesh;
   	 	this.GetComponent(MeshCollider).sharedMesh = mesh;
	}
	
	// Add plane
	function AddPlane ( vertices : Vector3[] ) {
		var plane : SurfacePlane = new SurfacePlane ( vertices );
  		
  		planes.Add ( plane );
	}
	
	// Clear all buttons
	function ClearButtons () {		
		for ( var b : Button in buttons ) {
			Destroy ( b.obj );
		}
		
		buttons.Clear();
	}
	
	// Update all buttons
	function UpdateButtons () {		
		for ( var b : Button in buttons ) {
			b.Update ();
		}
	}
	
	// Create all buttons
	function CreateButtons () {
		if ( Application.loadedLevel != 1 || EditorCore.GetSelectedObject() != this.gameObject ) { return; }
										
		ClearButtons ();
		
		for ( var plane : SurfacePlane in planes ) {
			// Vertex buttons
			for ( var i = 0; i < plane.vertices.Length; i++ ) {
				var vb : VertexButton = new VertexButton ( this, plane, i );
							
				buttons.Add ( vb );
			}
			
			// Plus buttons
			for ( var points : int[] in [ [0,1], [1,2], [2,3], [3,0] ] ) {
				var pb : PlusButton;
				
				pb = new PlusButton	( plane, points[0], points[1], this.transform );
				pb.btn.func = function () { PlusPlane ( plane, points[0], points[1] ); };
				pb.surface = this;
				buttons.Add ( pb );
			}
					
			// Minus buttons
			var mb : MinusButton = new MinusButton ( plane, this.transform );
			mb.btn.func = function () { MinusPlane ( plane ); };
			mb.surface = this;
			buttons.Add ( mb );
		}
		
	}
	
	// Init
	function ReloadFoliage () {
		
	}
	
	function ReloadMaterial () {
		material = Resources.Load ( materialPath ) as Material;
		this.GetComponent(MeshRenderer).material = material;
	}
	
	function Init () {
		mesh = new Mesh ();
		mesh.name = "Surface";
	   	    
	    this.GetComponent(MeshFilter).sharedMesh = mesh;
   	 	this.GetComponent(MeshCollider).sharedMesh = mesh;
		 
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
	
		Apply ();
	}
	
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
		
		if ( planes.Count == 0 ) {
	    	FirstPlane ();
	    }
	    
	}
	
	// Update
	function Update () {
		var b : Button;
		
		if ( EditorCore.GetSelectedObject() == this.gameObject ) {
			if ( buttons.Count <= 0 ) {
				CreateButtons ();
			
			} else {
				UpdateButtons ();
			
			}
			
		}
		
		/*if ( this.GetComponent(MeshFilter).mesh.vertices.Length <= 0 ) {
			Destroy ( this.gameObject );
		}*/
	}
}