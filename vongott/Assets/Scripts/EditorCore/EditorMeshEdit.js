#pragma strict

class EditorMeshEdit extends MonoBehaviour {
	public enum EditMode {
		Vertices,
		Edges,
		Triangles,
		Quads
	}
	
	public enum SelectMode {
		Normal,
		Box,
		Circle
	}
	
	public enum TransformMode {
		None,
		Grab,
		Rotate,
		Scale,
		Extrude
	}
	
	public enum TransformLock {
		None,
		X,
		Y,
		Z,
		XY,
		YZ,
		ZX
	}
	
	public var snap : float = 0.1;
	public var editMode : EditMode;
	public var transformMode : TransformMode;
	public var transformLock : TransformLock;
	public var selectMode : SelectMode;
	
	public var highlightMaterial : Material;
	public var selectedMaterial : Material;
		
	public var target : GameObject;
		
	private var drawTriangle : Vector3[] = new Vector3[3];
	private var drawQuad : Vector3[] = new Vector3[4];
	private var drawVertices : Vector3[];
	
	private var selectedVertices : List.< int > = new List.< int > ();
	private var vertexCaches : Dictionary.< int, VertexCache > = new Dictionary.< int, VertexCache > ();
	private var selectionBounds : Bounds;
	private var origMousePos : Vector3;
	private var mouseButtonTimer : float = 0;
	
	
	//////////////////
	// Member classes
	//////////////////
	// Vertex cache
	private class VertexCache {
		var offset : Vector3;
		var position : Vector3;
	}
	
	// Triangle
	private class Triangle {
		var indexes : int[] = new int[3];
		var vertices : Vector3 [] = new Vector3[3];
	
		function Triangle ( mesh : Mesh, t0 : int, t1 : int, t2 : int ) {
			indexes[0] = t0;
			indexes[1] = t1;
			indexes[2] = t2;
			
			vertices[0] = mesh.vertices[t0];
			vertices[1] = mesh.vertices[t1];
			vertices[2] = mesh.vertices[t2];
		}
	
		function Triangle ( v0 : Vector3, v1 : Vector3, v2 : Vector3 ) {
			vertices[0] = v0;
			vertices[1] = v1;
			vertices[2] = v2;
		}
		
		function TransformPoint ( t : Transform ) {
			t.TransformPoint ( vertices[0] );
			t.TransformPoint ( vertices[1] );
			t.TransformPoint ( vertices[2] );
		}
		
		static function GetQuad ( t0 : Triangle, t1 : Triangle ) : Quad {
			var verts : List.<Vector3> = new List.<Vector3>();
			
			for ( var v0 : Vector3 in t0.vertices ) {
				verts.Add ( v0 );
			}
			
			for ( var v1 : Vector3 in t1.vertices ) {
				if ( !verts.Contains ( v1 ) ) {
					verts.Add ( v1 );
				}
			}
			
			if ( verts.Count < 4 ) {
				Debug.LogError ( "EditorMeshEdit | Couldn't find quad for " + t0 + " and " + t1 );
			}
			
			return new Quad ( verts[0], verts[1], verts[2], verts[3] );
		}
	}
	
	// Quad
	private class Quad {
		var indexes : int[] = new int[4];
		var vertices : Vector3 [] = new Vector3[4];
		
		function Quad ( mesh : Mesh, t0 : int, t1 : int, t2 : int, t3 : int ) {
			indexes[0] = t0;
			indexes[1] = t1;
			indexes[2] = t2;
			indexes[3] = t3;
			
			vertices[0] = mesh.vertices[t0];
			vertices[1] = mesh.vertices[t1];
			vertices[2] = mesh.vertices[t2];
			vertices[3] = mesh.vertices[t3];
		}
					
		function Quad ( v0 : Vector3, v1 : Vector3, v2 : Vector3, v3 : Vector3 ) {
			vertices[0] = v0;
			vertices[1] = v1;
			vertices[2] = v2;
			vertices[3] = v3;
		}
		
		function TransformPoint ( t : Transform ) {
			t.TransformPoint ( vertices[0] );
			t.TransformPoint ( vertices[1] );
			t.TransformPoint ( vertices[2] );
			t.TransformPoint ( vertices[3] );
		}
	}
	
	
	//////////////////
	// Helper functions
	//////////////////
	// Find adjacent triangle
	private function FindAdjacentTriangle ( t : Triangle, m : Mesh ) : Triangle {
		for ( var i : int in m.triangles ) {
			if ( t.indexes[1] == i && t.indexes[2] == i+1 ) {
				return new Triangle ( m, i, i+1, i+2 ); 
			} 
		}
		
		return null;
	}
	
	// Find similar vertices
	private function FindSimilarVertices ( vertices : Vector3[], vertex : int ) : int[] {
		var tempList : List.< int > = new List.< int > ();
		
		for ( var i : int = 0; i < vertices.Length; i++ ) {
			if ( vertices[i] == vertices[vertex] ) {
				tempList.Add ( i );
			}
		}
	
		return tempList.ToArray();
	}
	
	// Round
	private function Round ( val : float, factor : float ) : float {
		return Mathf.Round ( val / factor ) * factor;
	}
	
	private function Round ( v : Vector3, factor : float ) : Vector3 {
		return new Vector3 ( Round ( v.x, factor ), Round ( v.y, factor ), Round ( v.z, factor ) );
	}
	
	// Draw vertex
	private function Draw2DVertex ( v : Vector3 ) {
		GL.Vertex3 ( v.x / Screen.width, v.y / Screen.height, v.z );
	}
	
	private function DrawVertex ( v : Vector3 ) {
		v += target.transform.position;
		GL.Vertex3 ( v.x, v.y, v.z );
	}
	
	// Draw border
	private function Draw2DBounds ( b : Bounds ) {
		b.center += target.transform.position;
		
		Draw2DLine ( new Vector3 ( b.min.x, b.min.y, 0 ), new Vector3 ( b.min.x, b.max.y, 0 ) );
		Draw2DLine ( new Vector3 ( b.min.x, b.max.y, 0 ), new Vector3 ( b.max.x, b.max.y, 0 ) );
		Draw2DLine ( new Vector3 ( b.max.x, b.max.y, 0 ), new Vector3 ( b.max.x, b.min.y, 0 ) );
		Draw2DLine ( new Vector3 ( b.max.x, b.min.y, 0 ), new Vector3 ( b.min.x, b.min.y, 0 ) );
	}
	
	// Draw line
	private function Draw2DLine ( from : Vector3, to : Vector3 ) {
		Draw2DVertex ( from );
		Draw2DVertex ( to );
	}
	
	private function DrawLine ( from : Vector3, to : Vector3 ) {
		DrawVertex ( from );
		DrawVertex ( to );
	}
	
	// Draw box
	private function DrawBox ( v : Vector3 ) {
		var right : Vector3 = this.camera.transform.right * 0.02;
		var up : Vector3 = this.camera.transform.up * 0.02;
	
		DrawVertex ( v - right + up );
		DrawVertex ( v + right + up );
		DrawVertex ( v + right - up );
		DrawVertex ( v - right - up );
	}
	
	// Get median point
	private function GetMedianPoint ( mesh : Mesh, indices : List.< int > ) : Vector3 {
		var result : Vector3;
		
		for ( var i : int in indices ) {
			result += mesh.vertices[i];
		}
		
		result /= indices.Count;
	
		return result;
	}
	
	// Rotate around pivot
	private function RotateAroundPivot ( point : Vector3, pivot : Vector3, angle : Vector3 ) : Vector3 {
    	return Quaternion.Euler ( angle ) * ( point - pivot ) + pivot;
    }
	
	// Scale around pivot
	private function ScaleAroundPivot ( point : Vector3, pivot : Vector3, scale : float ) {
		return pivot + ( point - pivot ) * scale;
	}
	
	// Find offsets
	private function FindOffsets ( mesh : Mesh, indices : List.< int > ) {
		var vertices : Vector3[] = mesh.vertices;
		
		vertexCaches.Clear ();
		
		for ( var i : int in indices ) {
			var cache : VertexCache = new VertexCache();
			
			cache.position = vertices[i];
			
			cache.offset = this.camera.WorldToScreenPoint ( vertices[i] );													
			cache.offset.x = cache.offset.x - Input.mousePosition.x;
			cache.offset.y = cache.offset.y - Input.mousePosition.y;
		
			vertexCaches.Add ( i, cache );
		}
	}
	
	// Cache vertices
	private function CacheVertices ( mesh : Mesh, indices : List.< int > ) {
		var vertices : Vector3[] = mesh.vertices;
		
		vertexCaches.Clear ();
		
		for ( var i : int in indices ) {
			var cache : VertexCache = new VertexCache();
			cache.position = vertices[i];
			vertexCaches.Add ( i, cache );
		}
	}
	
	// Grab vertices
	private function GrabVertices ( mesh : Mesh, indices : List.< int > ) {
		var vertices : Vector3[] = mesh.vertices;		
		var mousePos : Vector3 = Input.mousePosition;
	
		for ( var i : int in indices ) {
			var point : Vector3 = this.camera.WorldToScreenPoint ( vertices[i] );
						
			point.x = mousePos.x + vertexCaches[i].offset.x;
			point.y = mousePos.y + vertexCaches[i].offset.y;
			
			point = this.camera.ScreenToWorldPoint ( point );
			//point = Round ( point, snap );
			
			switch ( transformLock ) {
				case TransformLock.X:
					point = new Vector3 ( point.x, vertexCaches[i].position.y, vertexCaches[i].position.z );
					break;
				
				case TransformLock.Y:
					point = new Vector3 ( vertexCaches[i].position.x, point.y, vertexCaches[i].position.z );
					break;
					
				case TransformLock.Z:
					point = new Vector3 ( vertexCaches[i].position.x, vertexCaches[i].position.y, point.z );
					break;	
			}
																														
			for ( var v : int in FindSimilarVertices ( vertices, i ) ) {
				vertices[v] = point;
			}
		}
				
		RefreshMesh ( vertices );
	
		drawVertices = mesh.vertices;
	}
	
	// Rotate vertices
	private function RotateVertices ( mesh : Mesh, indices : List.< int > ) {
		var vertices : Vector3[] = mesh.vertices;
		var mousePos : Vector3 = Input.mousePosition;
		var medianPoint : Vector3 = GetMedianPoint ( mesh, indices );
		var angle : Vector3 = this.camera.transform.forward;
		var amount : float = Input.GetAxis("Mouse ScrollWheel");
		
		if ( Input.GetKey ( KeyCode.LeftShift ) ) {
			amount *= 4;
		
		} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
			amount *= 20;
		
		} else {
			amount *= 10;
		
		}
		
		switch ( transformLock ) {
			case TransformLock.X:
				angle = Vector3.left;
				break;
			
			case TransformLock.Y:
				angle = Vector3.up;
				break;
				
			case TransformLock.Z:
				angle = Vector3.forward;
				break;	
		}
		
		for ( var i : int in indices ) {
			var point : Vector3 = RotateAroundPivot ( vertices[i], medianPoint, angle * amount );
																																																																																				
			for ( var v : int in FindSimilarVertices ( vertices, i ) ) {
				vertices[v] = point;
			}
		}
		
		RefreshMesh ( vertices );
	
		drawVertices = mesh.vertices;
	}
	
	// Scale vertices
	private function ScaleVertices ( mesh : Mesh, indices : List.< int > ) {
		var vertices : Vector3[] = mesh.vertices;		
		var mousePos : Vector3 = Input.mousePosition;
		var medianPoint : Vector3 = GetMedianPoint ( mesh, indices );
		var amount : float = 1;
		
		if ( Input.GetAxis("Mouse ScrollWheel") < 0 ) {
			if ( Input.GetKey ( KeyCode.LeftShift ) ) {
				amount = 0.9;
			
			} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				amount = 0.5;
			
			} else {
				amount = 0.8;
			
			}
		
		} else if ( Input.GetAxis("Mouse ScrollWheel") > 0 ) {
			if ( Input.GetKey ( KeyCode.LeftShift ) ) {
				amount = 1.1;
			
			} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				amount = 1.5;
			
			} else {
				amount = 1.2;
			
			}
		}
	
		for ( var i : int in indices ) {
			var point : Vector3 = ScaleAroundPivot ( vertices[i], medianPoint, amount );
						
			switch ( transformLock ) {
				case TransformLock.Y:
					point = new Vector3 ( point.x, vertexCaches[i].position.y, vertexCaches[i].position.z );
					break;
				
				case TransformLock.X:
					point = new Vector3 ( vertexCaches[i].position.x, point.y, vertexCaches[i].position.z );
					break;
					
				case TransformLock.Z:
					point = new Vector3 ( vertexCaches[i].position.x, vertexCaches[i].position.y, point.z );
					break;	
			}
																														
			for ( var v : int in FindSimilarVertices ( vertices, i ) ) {
				vertices[v] = point;
			}
		}
				
		RefreshMesh ( vertices );
	
		drawVertices = mesh.vertices;
	}
	
	// Mode input
	private function HandleModeInput ( mesh : Mesh ) {
		// Cancel		
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			Cancel ();
		}
		
		// Transform modes
		if ( selectedVertices.Count > 0 && transformMode == TransformMode.None ) {
			if ( Input.GetKeyDown ( KeyCode.G ) ) {
				FindOffsets ( mesh, selectedVertices );
			
				transformMode = TransformMode.Grab;
			
			} else if ( Input.GetKeyDown ( KeyCode.R ) ) {				
				CacheVertices ( mesh, selectedVertices );
				
				transformMode = TransformMode.Rotate;
			
			} else if ( Input.GetKeyDown ( KeyCode.S ) ) {
				CacheVertices ( mesh, selectedVertices );
				
				transformMode = TransformMode.Scale;
			
			} else if ( Input.GetKeyDown ( KeyCode.E ) ) {
				transformMode = TransformMode.Extrude;
			
			}
		}
		
		// Selection modes
		if ( Input.GetMouseButton ( 0 ) ) {
			mouseButtonTimer += Time.deltaTime;
		} else {
			origMousePos = Vector3.zero;
			mouseButtonTimer = 0;
		}
		
		if ( mouseButtonTimer > 0.1 ) {
			if ( origMousePos == Vector3.zero ) {
				origMousePos = Input.mousePosition;
			}
			selectMode = SelectMode.Box;
		
		} else if ( Input.GetKeyDown ( KeyCode.C ) ) {
			selectMode = SelectMode.Circle;
		}
	}
	
	// Lock input
	private function HandleLockInput () {
		if ( Input.GetKeyDown ( KeyCode.X ) ) {
			if ( transformLock == TransformLock.X ) {
				transformLock = TransformLock.None;
			} else {
				transformLock = TransformLock.X;
			}
		
		} else if ( Input.GetKeyDown ( KeyCode.Y ) ) {
			if ( transformLock == TransformLock.Y ) {
				transformLock = TransformLock.None;
			} else {
				transformLock = TransformLock.Y;
			}
		
		} else if ( Input.GetKeyDown ( KeyCode.Z ) ) {
			if ( transformLock == TransformLock.Z ) {
				transformLock = TransformLock.None;
			} else {
				transformLock = TransformLock.Z;
			}
		
		}
	}
	
	// Vertex selection
	private function HandleVertexSelection () {
		var i : int = 0;
		var screenPoint : Vector3;
		
		if ( selectMode == SelectMode.Box ) {
			if ( Input.GetMouseButton ( 0 ) ) {
				var currentMousePos : Vector3 = Input.mousePosition;
				var left : float;
				var right : float;
				var top : float;
				var bottom : float;
				
				if ( origMousePos.x < currentMousePos.x ) { left = origMousePos.x; right = currentMousePos.x; } else { left = currentMousePos.x; right = origMousePos.x; }
				if ( origMousePos.y > currentMousePos.y ) { top = origMousePos.y; bottom = currentMousePos.y; } else { top = currentMousePos.y; bottom = origMousePos.y; }
				
				selectionBounds = new Bounds ( new Vector3 ( left + (right-left)/2, bottom + (top-bottom)/2, 0 ), new Vector3 ( right - left, bottom - top, 0 ) );
								
				// Loop through all visible vertices
				for ( i = 0; i < drawVertices.Length; i++ ) {				
					
					screenPoint = this.camera.WorldToScreenPoint ( drawVertices[i] );
					screenPoint.z = 0;
					
					// If the points is within the selected box, select the vertex
					if ( screenPoint.x > selectionBounds.min.x && screenPoint.x < selectionBounds.max.x && screenPoint.y < selectionBounds.max.y && screenPoint.y > selectionBounds.min.x ) {
						if ( Input.GetKey ( KeyCode.LeftShift ) ) {
							if ( selectedVertices.Contains ( i ) ) {
								selectedVertices.Remove ( i );	
							}
																			
						} else if ( !selectedVertices.Contains ( i ) ) {
							selectedVertices.Add ( i );
						
						}
					
					} else if ( selectedVertices.Contains ( i ) ) {
						selectedVertices.Remove ( i );	
					
					} 
				}
			
			} else {
				selectMode = SelectMode.Normal;
				
			}
	
		} else {			
			if ( Input.GetMouseButtonDown ( 0 ) ) {
				var radius : float = 30;
				
				if ( selectMode == SelectMode.Circle ) {
					radius = 60;
				}
			
				// Loop through all visible vertices
				for ( i = 0; i < drawVertices.Length; i++ ) {				
					screenPoint = this.camera.WorldToScreenPoint ( drawVertices[i] );
					screenPoint.z = 0;
					
					// If the distance is short enough, select or deselect the vertex
					if ( Vector3.Distance ( Input.mousePosition, screenPoint ) < radius ) {
						if ( Input.GetKey ( KeyCode.LeftShift ) ) {
							if ( selectedVertices.Contains ( i ) ) {
								selectedVertices.Remove ( i );
								
							} else {
								selectedVertices.Add ( i );
							
							}
																			
						} else {
							selectedVertices.Clear ();
							selectedVertices.Add ( i );
						
						}
						
						return;
					}
				}
				
				// If nothing is selected, clear
				if ( !Input.GetKey ( KeyCode.LeftShift ) ) {
					selectedVertices.Clear ();
				}
			}
		
		}
	}
	
	// Refresh
	private function RefreshMesh ( vertices : Vector3[] ) {
		var mesh : Mesh = target.GetComponent(MeshFilter).mesh;
		
		mesh.vertices = vertices;
		
		mesh.RecalculateNormals ();
		mesh.RecalculateBounds ();
	}
	
	// Apply
	private function Apply () {
		transformMode = TransformMode.None;
		transformLock = TransformLock.None;
		
		vertexCaches.Clear ();
	}
	
	// Cancel
	private function Cancel () {
		transformMode = TransformMode.None;
		transformLock = TransformLock.None;
		selectMode = SelectMode.Normal;
		
		var mesh : Mesh = target.GetComponent(MeshFilter).mesh;
		var vertices : Vector3[] = mesh.vertices;
	
		for ( var kvp : KeyValuePair.< int, VertexCache > in vertexCaches ) {
			for ( var v : int in FindSimilarVertices ( vertices, kvp.Key ) ) {
				vertices[v] = kvp.Value.position;
			}
		}
		
		RefreshMesh ( vertices );
		
		vertexCaches.Clear ();
	}
	
	
	//////////////////
	// Draw
	//////////////////
	function OnPostRender () {
		if ( !target ) { return; }
	
		var mesh : Mesh = target.GetComponent(MeshFilter).mesh;
		
		if ( editMode == EditMode.Triangles ) {
			highlightMaterial.SetPass(0);
			
			GL.Begin ( GL.TRIANGLES );
			
			DrawVertex ( drawTriangle[0] );
			DrawVertex ( drawTriangle[1] );
			DrawVertex ( drawTriangle[2] );
			
			GL.End ();
			
		} else if ( editMode == EditMode.Quads ) {
			highlightMaterial.SetPass(0);
			
			GL.Begin ( GL.QUADS );
			
			DrawVertex ( drawQuad[0] );
			DrawVertex ( drawQuad[1] );
			DrawVertex ( drawQuad[2] );
			DrawVertex ( drawQuad[3] );
			
			GL.End ();
			
		} else if ( editMode == EditMode.Vertices && drawVertices != null ) {
			highlightMaterial.SetPass(0);
			
			GL.Begin ( GL.QUADS );
			
			for ( var v : Vector3 in drawVertices ) {
				DrawBox ( v );
			}
			
			GL.End ();
			
			for ( var h : int = 0; h < selectedVertices.Count; h++ ) {
				selectedMaterial.SetPass(0);
			
				GL.Begin ( GL.QUADS );
				
				DrawBox ( drawVertices[selectedVertices[h]] );
				
				GL.End ();			
			}
		}
		
		if ( selectMode == SelectMode.Box ) {
			selectedMaterial.SetPass(0);
			
			GL.Begin ( GL.LINES );
			GL.LoadOrtho();
				
			Draw2DBounds ( selectionBounds );
		
			GL.End ();
		}
	}
	
	
	//////////////////
	// Update
	//////////////////
	function Update () {
		if ( !target ) { return; }
		
		var mesh : Mesh = target.GetComponent(MeshFilter).mesh;
		var vertices : Vector3[] = mesh.vertices;
		var triangles : int[] = mesh.triangles;
		var mouseHit : RaycastHit;
		var mousePos : Vector3 = Input.mousePosition;
		
		// Set modes
		HandleModeInput ( mesh );
		
		// Transform
		// ^ Grab
		if ( transformMode == TransformMode.Grab ) {
			HandleLockInput ();
			
			GrabVertices ( mesh, selectedVertices );
		
			if ( Input.GetMouseButtonDown ( 0 ) ) {
				Apply ();
			}
			
		// ^ Rotate
		} else if ( transformMode == TransformMode.Rotate ) {
			HandleLockInput ();
			
			RotateVertices ( mesh, selectedVertices );
		
			if ( Input.GetMouseButtonDown ( 0 ) ) {
				Apply ();
			}
			
		// ^ Scale
		} else if ( transformMode == TransformMode.Scale ) {
			HandleLockInput ();
			
			ScaleVertices ( mesh, selectedVertices );
		
			if ( Input.GetMouseButtonDown ( 0 ) ) {
				Apply ();
			}
		
		// Select
		} else {
			// Individual vertices
			if ( editMode == EditMode.Vertices ) {
				drawVertices = mesh.vertices;
				
				HandleVertexSelection ();
			}
		}
	}
	
	
	//////////////////
	// Init
	//////////////////
	public function Init ( obj : GameObject ) {
		target = obj;
	}
	
	function OnEnable () {
		//Init ( EditorCore.GetSelectedObject() );
	}
}