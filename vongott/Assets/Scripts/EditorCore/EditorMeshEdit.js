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
			
	private var selectedVertices : List.< int > = new List.< int > ();
	private var selectedTriangles : List.< Triangle > = new List.< Triangle > ();
	private var selectedEdges : List.< Edge > = new List.< Edge > ();
	
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
	
	private class Triangle {
		var indices : int[] = new int[3];
	
		function Triangle ( a : int, b : int, c : int ) {
			indices[0] = a;
			indices[1] = b;
			indices[2] = c;
		}
	}
	
	private class Edge {
		var indices : int[] = new int[2];
	
		function Edge ( a : int, b : int ) {
			indices[0] = a;
			indices[1] = b;
		}
	}
	
	private class Quad {
		var vertices : int[] = new int[4];
	}
	
	
	//////////////////
	// Helper functions
	//////////////////
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
	
	// Get triangles
	private function GetTriangles ( mesh : Mesh ) : Triangle[] {
		var list : List.< Triangle > = new List.< Triangle > ();
		
		for ( var i : int = 0; i < mesh.triangles.Length; i += 3 ) {
			var t : Triangle = new Triangle ( mesh.triangles[i], mesh.triangles[i+1], mesh.triangles[i+2] );
			list.Add ( t );
		}
		
		return list.ToArray();
	}
	
	// Get edges
	private function GetEdges ( mesh : Mesh ) : Edge[] {
		var list : List.< Edge > = new List.< Edge > ();
		
		for ( var i : int = 0; i < mesh.vertices.Length; i++ ) {
			var a : int = i;
			var b : int = i+1;
			
			if ( b >= mesh.vertices.Length ) {
				b = 0;
			}
			
			var e : Edge = new Edge ( a, b );
			list.Add ( e );
		}
		
		return list.ToArray();
	}
	
	// Selection
	private function SelectAll () {
		ClearSelection ();
		
		for ( var i : int = 0; i < target.GetComponent(MeshFilter).mesh.vertices.Length; i++ ) {
			selectedVertices.Add ( i );
		}
	}
	
	private function SelectNone () {
		selectedVertices.Clear ();
	}
	
	// Get median point
	private function GetMedianPoint ( indices : int[] ) : Vector3 {
		var result : Vector3;
		var mesh : Mesh = target.GetComponent(MeshFilter).mesh;
		
		for ( var i : int in indices ) {
			result += mesh.vertices[i];
		}
		
		result /= indices.Length;
	
		return result;
	}
	
	// Can raycast to
	private function CanRaycastTo ( v : Vector3 ) : boolean {
		return !Physics.Linecast ( this.camera.ScreenToWorldPoint ( Input.mousePosition ), v );
	}
	
	private function CanRaycastTo ( t : Triangle ) : boolean {				
		return CanRaycastTo ( GetMedianPoint ( t.indices ) );
	}
	
	private function CanRaycastTo ( e : Edge ) : boolean {				
		return CanRaycastTo ( GetMedianPoint ( e.indices ) );
	}
	
	// Get mouse distance
	private function GetMouseDistance ( v : Vector3 ) : float {
		var mousePos : Vector3 = Input.mousePosition;
	
		return ( this.camera.WorldToScreenPoint ( v ) - mousePos ).sqrMagnitude;
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
	private function FindMouseOffsets ( mesh : Mesh, indices : int[] ) {
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
	
	// Get visible vertices
	private function GetVisibleVertices ( vertices : Vector3[] ) : int[] {
		var visible : List.< int > = new List.< int > ();
		
		for ( var v : int = 0; v < vertices.Length; v++ ) {
			if ( CanRaycastTo ( vertices[v] ) ) {
				visible.Add ( v );
			}
		}
		
		return visible.ToArray();
	}
	
	// Get visible triangles
	private function GetVisibleTriangles ( triangles : Triangle[] ) : Triangle[] {
		var visible : List.< Triangle > = new List.< Triangle > ();
		
		for ( var t : int = 0; t < triangles.Length; t++ ) {
			if ( CanRaycastTo ( triangles[t] ) ) {
				visible.Add ( triangles[t] );
			}
		}
		
		return visible.ToArray();
	}
	
	// Get visible edges
	private function GetVisibleEdges ( edges : Edge[] ) : Edge[] {
		var visible : List.< Edge > = new List.< Edge > ();
		
		for ( var e : int = 0; e < edges.Length; e++ ) {
			if ( CanRaycastTo ( edges[e] ) ) {
				visible.Add ( edges[e] );
			}
		}
		
		return visible.ToArray();
	}
	
	// Cache vertices
	private function CacheVertices ( mesh : Mesh, indices : int[] ) {
		var vertices : Vector3[] = mesh.vertices;
		
		vertexCaches.Clear ();
		
		for ( var i : int in indices ) {
			var cache : VertexCache = new VertexCache();
			cache.position = vertices[i];
			vertexCaches.Add ( i, cache );
		}
	}
	
	
	//////////////////
	// Transform
	//////////////////
	// Grab vertices
	private function GrabVertices ( mesh : Mesh, indices : int[] ) {
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
	}
	
	// Rotate vertices
	private function RotateVertices ( mesh : Mesh, indices : int [] ) {
		var vertices : Vector3[] = mesh.vertices;
		var mousePos : Vector3 = Input.mousePosition;
		var medianPoint : Vector3 = GetMedianPoint ( indices );
		var angle : Vector3 = this.camera.transform.forward;
		var amount : float = ( this.camera.WorldToScreenPoint ( medianPoint ).x - Input.mousePosition.x ) * 0.1;
		
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
			var point : Vector3 = RotateAroundPivot ( vertexCaches[i].position, medianPoint, angle * amount );
																																																																																				
			for ( var v : int in FindSimilarVertices ( vertices, i ) ) {
				vertices[v] = point;
			}
		}
		
		RefreshMesh ( vertices );
	}
	
	// Scale vertices
	private function ScaleVertices ( mesh : Mesh, indices : int[] ) {
		var vertices : Vector3[] = mesh.vertices;		
		var mousePos : Vector3 = Input.mousePosition;
		var medianPoint : Vector3 = GetMedianPoint ( indices );
		var amount : float = Vector3.Distance ( Input.mousePosition, this.camera.WorldToScreenPoint ( medianPoint ) ) * 0.005;
	
		for ( var i : int in indices ) {
			var point : Vector3 = ScaleAroundPivot ( vertexCaches[i].position, medianPoint, amount );
						
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
	}
	
	
	//////////////////
	// Modes
	//////////////////
	private function HandleModeInput ( mesh : Mesh ) {
		// Edit modes
		if ( Input.GetKey ( KeyCode.LeftShift ) && Input.GetKeyDown ( KeyCode.V ) && editMode != EditMode.Vertices ) {
			editMode = EditMode.Vertices;
			selectedTriangles.Clear ();
			selectedEdges.Clear ();
		
		} else if ( Input.GetKey ( KeyCode.LeftShift ) && Input.GetKeyDown ( KeyCode.T ) && editMode != EditMode.Triangles ) {
			editMode = EditMode.Triangles;
			selectedVertices.Clear ();
			selectedEdges.Clear ();
			
		} else if ( Input.GetKey ( KeyCode.LeftShift ) && Input.GetKeyDown ( KeyCode.E ) && editMode != EditMode.Edges ) {
			editMode = EditMode.Edges;
			selectedVertices.Clear ();
			selectedTriangles.Clear ();
			
		}
		
		// Cancel		
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			Cancel ();
		}
		
		// Transform modes
		if ( selectedVertices.Count > 0 && transformMode == TransformMode.None ) {
			if ( Input.GetKeyDown ( KeyCode.G ) ) {
				FindMouseOffsets ( mesh, selectedVertices.ToArray() );
			
				transformMode = TransformMode.Grab;
			
			} else if ( Input.GetKeyDown ( KeyCode.R ) ) {				
				CacheVertices ( mesh, selectedVertices.ToArray() );
				
				transformMode = TransformMode.Rotate;
			
			} else if ( Input.GetKeyDown ( KeyCode.S ) ) {
				CacheVertices ( mesh, selectedVertices.ToArray() );
				
				transformMode = TransformMode.Scale;
			
			} else if ( Input.GetKeyDown ( KeyCode.E ) ) {
				transformMode = TransformMode.Extrude;
			
			}
		}
		
		// Selection modes
		if ( Input.GetKeyDown ( KeyCode.B ) ) {
			if ( selectMode == SelectMode.Normal ) {
				origMousePos = Input.mousePosition;
				selectMode = SelectMode.Box;
			
			} else {
				origMousePos = Vector3.zero;
				selectMode = SelectMode.Normal;
		
			}
		
		} else if ( Input.GetKeyDown ( KeyCode.C ) ) {
			selectMode = SelectMode.Circle;
		
		} else if ( Input.GetKeyDown ( KeyCode.A ) && transformMode == TransformMode.None ) {
			if ( selectedVertices.Count == 0 ) {
				SelectAll ();
				
			} else {
				SelectNone ();
			
			}
		
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
	
	
	////////////////////
	// Selection
	////////////////////
	private function ClearSelection () {
		selectedVertices.Clear ();
		selectedEdges.Clear ();
		selectedTriangles.Clear ();
	}
	
	private function AddSelection ( e : Edge, clearFirst : boolean ) {
		if ( clearFirst ) {
			ClearSelection ();
			
			selectedEdges.Add ( e );
			
			for ( var i : int in e.indices ) {
				if ( !selectedVertices.Contains ( i ) ) {
					selectedVertices.Add ( i );
				}
			}
		
		} else {
			if ( selectedEdges.Contains ( e ) ) {
				selectedEdges.Remove ( e );
			
				for ( var i : int in e.indices ) {
					if ( selectedVertices.Contains ( i ) ) {
						selectedVertices.Remove ( i );
					}
				}
			
			} else {
				selectedEdges.Add ( e );
				
				for ( var i : int in e.indices ) {
					if ( !selectedVertices.Contains ( i ) ) {
						selectedVertices.Add ( i );
					}
				}
			
			}
		}
	}
	
	private function AddSelection ( t : Triangle, clearFirst : boolean ) {
		if ( clearFirst ) {
			ClearSelection ();
			
			selectedTriangles.Add ( t );
			
			for ( var i : int in t.indices ) {
				if ( !selectedVertices.Contains ( i ) ) {
					selectedVertices.Add ( i );
				}
			}
		
		} else {
			if ( selectedTriangles.Contains ( t ) ) {
				selectedTriangles.Remove ( t );
			
				for ( var i : int in t.indices ) {
					if ( selectedVertices.Contains ( i ) ) {
						selectedVertices.Remove ( i );
					}
				}
			
			} else {
				selectedTriangles.Add ( t );
				
				for ( var i : int in t.indices ) {
					if ( !selectedVertices.Contains ( i ) ) {
						selectedVertices.Add ( i );
					}
				}
			
			}
		}
	}
	
	// Edge selection
	private function HandleEdgeSelection ( edges : Edge[] ) {
		if ( Input.GetMouseButtonDown ( 0 ) ) {
			var clickedEdge : Edge;
			var visibleEdges : Edge[] = GetVisibleEdges ( edges );
			var radius : float = 60;
			
			for ( var e : Edge in visibleEdges ) {
				if ( GetMouseDistance ( GetMedianPoint ( e.indices ) ) < radius ) {
					clickedEdge = e;
					break;
				}
			}
		
			if ( clickedEdge == null ) {		
				if ( !Input.GetKey ( KeyCode.LeftShift ) ) {
					ClearSelection ();
				}
				
			} else {
				if ( Input.GetKey ( KeyCode.LeftShift ) ) {
					AddSelection ( clickedEdge, false );
				
				} else {
					AddSelection ( clickedEdge, true );
					
				}
			}
		
		}
	}
	
	// Triangle selection
	private function HandleTriangleSelection ( triangles : Triangle[] ) {
		if ( Input.GetMouseButtonDown ( 0 ) ) {
			var clickedTriangle : Triangle;
			var visibleTriangles : Triangle[] = GetVisibleTriangles ( triangles );
			var radius : float = 80;
			
			for ( var t : Triangle in visibleTriangles ) {
				if ( GetMouseDistance ( GetMedianPoint ( t.indices ) ) < radius ) {
					clickedTriangle = t;
					break;
				}
			}
			
			if ( clickedTriangle == null ) {
				if ( !Input.GetKey ( KeyCode.LeftShift ) ) {
					ClearSelection ();
				}
			
			} else {
				if ( Input.GetKey ( KeyCode.LeftShift ) ) {
					AddSelection ( clickedTriangle, false );
				
				} else {
					AddSelection ( clickedTriangle, true );
					
				}
		
			}
		}
	}
	
	// Quad selection
	private function HandleQuadSelection ( vertices : Vector3[] ) {
		if ( Input.GetMouseButtonDown ( 0 ) ) {
			var visibleVertices : int[] = GetVisibleVertices ( vertices );
						
			System.Array.Sort ( visibleVertices, function ( a : int, b : int ) {
				return GetMouseDistance ( vertices[a] ).CompareTo ( GetMouseDistance ( vertices[b] ) );
			} );
			
			// Add the closest verts
			for ( var i : int = 0; i < 4; i++ ) {
				for ( var vert : int in FindSimilarVertices ( vertices, visibleVertices[i] ) ) {
					selectedVertices.Add ( vert );
				}
			}
		}
	}
	
	// Vertex selection
	private function HandleVertexSelection ( vertices : Vector3[] ) {
		var i : int = 0;
		var screenPoint : Vector3;
		
		if ( selectMode == SelectMode.Box ) {
			var currentMousePos : Vector3 = Input.mousePosition;
			var left : float;
			var right : float;
			var top : float;
			var bottom : float;
			
			if ( origMousePos.x < currentMousePos.x ) { left = origMousePos.x; right = currentMousePos.x; } else { left = currentMousePos.x; right = origMousePos.x; }
			if ( origMousePos.y > currentMousePos.y ) { top = origMousePos.y; bottom = currentMousePos.y; } else { top = currentMousePos.y; bottom = origMousePos.y; }
			
			selectionBounds = new Bounds ( new Vector3 ( left + (right-left)/2, bottom + (top-bottom)/2, 0 ), new Vector3 ( right - left, bottom - top, 0 ) );
							
			// Loop through all visible vertices
			for ( i = 0; i < vertices.Length; i++ ) {				
				
				screenPoint = this.camera.WorldToScreenPoint ( vertices[i] );
				screenPoint.z = 0;
				
				// If the point is within the selected box, select the vertex
				if ( CanRaycastTo ( vertices[i] ) && screenPoint.x > selectionBounds.min.x && screenPoint.x < selectionBounds.max.x && screenPoint.y < selectionBounds.max.y && screenPoint.y > selectionBounds.min.y ) {
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
			if ( Input.GetMouseButtonDown ( 0 ) ) {
				var radius : float = 30;
				
				if ( selectMode == SelectMode.Circle ) {
					radius = 60;
				}
			
				// Loop through all visible vertices
				for ( i = 0; i < vertices.Length; i++ ) {				
					screenPoint = this.camera.WorldToScreenPoint ( vertices[i] );
					screenPoint.z = 0;
					
					// If the distance is short enough, and the vertex can be raycast to, select or deselect it
					if ( CanRaycastTo ( vertices[i] ) && Vector3.Distance ( Input.mousePosition, screenPoint ) < radius ) {
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
					ClearSelection ();
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
	
	// Draw vertices
	private function DrawVertices ( mesh : Mesh ) {
		// Highlights
		highlightMaterial.SetPass(0);
		GL.Begin ( GL.QUADS );
		
		for ( var v : Vector3 in mesh.vertices ) {
			DrawBox ( v );
		}
		
		GL.End ();
		
		// Selection
		selectedMaterial.SetPass(0);
		GL.Begin ( GL.QUADS );
		
		for ( var h : int = 0; h < selectedVertices.Count; h++ ) {
			DrawBox ( mesh.vertices[selectedVertices[h]] );							
		}
		
		GL.End ();
	}
	
	// Draw triangles
	private function DrawTriangles ( mesh : Mesh ) {
		var triangles : Triangle[] = GetTriangles ( mesh );
		
		// Highlights
		highlightMaterial.SetPass(0);
		GL.Begin ( GL.QUADS );
		
		for ( var t : Triangle in triangles ) {
			DrawBox ( GetMedianPoint ( t.indices ) );
		}
		
		GL.End ();
		
		GL.Begin ( GL.LINES );
		
		for ( var t : Triangle in triangles ) {
			DrawTriangle ( t, mesh );
		}
		
		GL.End ();
		
		// Selection
		selectedMaterial.SetPass(0);
		GL.Begin ( GL.QUADS );
		
		for ( var t : Triangle in selectedTriangles ) {
			DrawBox ( GetMedianPoint ( t.indices ) );
		}
		
		GL.End ();
		
		GL.Begin ( GL.TRIANGLES );
		
		for ( var t : int = 0; t < selectedTriangles.Count; t++ ) {
			DrawTriangleFace ( selectedTriangles[t], mesh );			
		}
			
		GL.End ();
	}
	
	// Draw edges
	private function DrawEdges ( mesh : Mesh ) {
		var edges : Edge[] = GetEdges ( mesh );
		
		// Highlights
		highlightMaterial.SetPass(0);
		GL.Begin ( GL.QUADS );
		
		for ( var e : Edge in edges ) {
			DrawBox ( GetMedianPoint ( e.indices ) );
		}
		
		GL.End ();
		
		GL.Begin ( GL.LINES );
		
		for ( var e : Edge in edges ) {
			DrawEdge ( e, mesh );
		}
		
		GL.End ();
		
		// Selection
		selectedMaterial.SetPass(0);
		
		GL.Begin ( GL.QUADS );
		
		for ( var e : Edge in selectedEdges ) {
			DrawBox ( GetMedianPoint ( e.indices ) );
		}
		
		GL.End ();
		
		GL.Begin ( GL.LINES );
		
		for ( var e : int = 0; e < selectedEdges.Count; e++ ) {
			DrawEdge ( selectedEdges[e], mesh );			
		}
			
		GL.End ();
	}
	
	// Draw edge
	private function DrawEdge( e : Edge, mesh : Mesh ) {
		DrawVertex ( mesh.vertices[e.indices[0]] );
		DrawVertex ( mesh.vertices[e.indices[1]] );
	}
	
	// Draw triangle
	private function DrawTriangle ( t : Triangle, mesh : Mesh ) {
		DrawLine ( mesh.vertices[t.indices[0]], mesh.vertices[t.indices[1]] );
		DrawLine ( mesh.vertices[t.indices[1]], mesh.vertices[t.indices[2]] );
		DrawLine ( mesh.vertices[t.indices[2]], mesh.vertices[t.indices[0]] );
	}
	
	private function DrawTriangleFace ( t : Triangle, mesh : Mesh ) {
		DrawVertex ( mesh.vertices[t.indices[0]] );
		DrawVertex ( mesh.vertices[t.indices[1]] );
		DrawVertex ( mesh.vertices[t.indices[2]] );
	}
	
	// Render
	function OnPostRender () {
		if ( !target ) { return; }
	
		var mesh : Mesh = target.GetComponent(MeshFilter).mesh;
		var vertices : Vector3[] = mesh.vertices;
		
		switch ( editMode ) {
			case EditMode.Vertices:
				DrawVertices ( mesh );	
				break;
				
			case EditMode.Triangles:
				DrawTriangles ( mesh );
				break;
				
			case EditMode.Edges:
				DrawEdges ( mesh );
				break;
		}
		
		if ( selectMode == SelectMode.Box ) {
			highlightMaterial.SetPass(0);
			
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
		var mouseHit : RaycastHit;
		var mousePos : Vector3 = Input.mousePosition;
		
		// Set modes
		HandleModeInput ( mesh );
		
		// Transform
		// ^ Grab
		if ( transformMode == TransformMode.Grab ) {
			HandleLockInput ();
			
			GrabVertices ( mesh, selectedVertices.ToArray() );
		
			if ( Input.GetMouseButtonDown ( 0 ) ) {
				Apply ();
			}
			
		// ^ Rotate
		} else if ( transformMode == TransformMode.Rotate ) {
			HandleLockInput ();
			
			RotateVertices ( mesh, selectedVertices.ToArray() );
		
			if ( Input.GetMouseButtonDown ( 0 ) ) {
				Apply ();
			}
			
		// ^ Scale
		} else if ( transformMode == TransformMode.Scale ) {
			HandleLockInput ();
			
			ScaleVertices ( mesh, selectedVertices.ToArray() );
		
			if ( Input.GetMouseButtonDown ( 0 ) ) {
				Apply ();
			}
		
		// Select
		} else {
			if ( editMode == EditMode.Vertices ) {
				HandleVertexSelection ( vertices );
			
			} else if ( editMode == EditMode.Quads ) {
				HandleQuadSelection ( vertices );
			
			} else if ( editMode == EditMode.Triangles ) {
				var triangles : Triangle[] = GetTriangles ( mesh );
				HandleTriangleSelection ( triangles );
			
			} else if ( editMode == EditMode.Edges ) {
				var edges : Edge[] = GetEdges ( mesh );
				HandleEdgeSelection ( edges );
			
			}
		}
	}
}