#pragma strict

class EditorSelectionBox extends MonoBehaviour {
	public var lineMaterial : Material;
	public var wireframeMode : boolean = false;
	
	private var lines : Vector3[];
	private var linesArray : Array;
	
	function Fit ( mesh : Mesh, wireframe : boolean ) {
		wireframeMode = wireframe;
		
		this.GetComponent(MeshRenderer).enabled = !wireframeMode;
		
		if ( wireframe ) {
			linesArray = new Array();
		
		    for ( var i : int = 0; i < mesh.triangles.length / 3; i++) {
		        linesArray.Add(this.transform.TransformPoint(mesh.vertices[mesh.triangles[i * 3]]));
		        linesArray.Add(this.transform.TransformPoint(mesh.vertices[mesh.triangles[i * 3 + 1]]));
		        linesArray.Add(this.transform.TransformPoint(mesh.vertices[mesh.triangles[i * 3 + 2]]));
		    }
		
		    lines = linesArray.ToBuiltin(Vector3) as Vector3[];
		
		} else {
			this.GetComponent(MeshFilter).sharedMesh = mesh;
		
		}
	}
	
	function Fit ( vertices : Vector3[], triangles : int[], wireframe : boolean ) {
		var newMesh : Mesh = new Mesh();
		newMesh.vertices = vertices;
		newMesh.triangles = triangles;
		
		Fit ( newMesh, wireframe );
	}
	
	function Fit ( obj : GameObject, wireframe : boolean ) {
		var mesh : Mesh;
		var skinnedMeshRenderer : SkinnedMeshRenderer = obj.GetComponentInChildren(SkinnedMeshRenderer);
		var meshFilter : MeshFilter = obj.GetComponentInChildren(MeshFilter);
		
		if ( skinnedMeshRenderer ) {
			mesh = skinnedMeshRenderer.sharedMesh;
		
		} else if ( meshFilter ) {
			mesh = meshFilter.sharedMesh;
		
		}
		
		this.transform.position = obj.transform.position;
		
		Fit ( mesh, wireframe );
	}
	
	function OnRenderObject() {  
	    if ( wireframeMode ) {
		    lineMaterial.SetPass(0);
		
		    //GL.PushMatrix();
		    //GL.MultMatrix(transform.localToWorldMatrix);
		    GL.Begin(GL.LINES);
		
		    for ( var i = 0; i < lines.length / 3; i++) {
		        GL.Vertex(lines[i * 3]);
		        GL.Vertex(lines[i * 3 + 1]);
		        GL.Vertex(lines[i * 3 + 1]);
		        GL.Vertex(lines[i * 3 + 2]);
		        GL.Vertex(lines[i * 3 + 2]);
		        GL.Vertex(lines[i * 3]);
		    }
		
		    GL.End();
		    //GL.PopMatrix();
	    }
	}
}