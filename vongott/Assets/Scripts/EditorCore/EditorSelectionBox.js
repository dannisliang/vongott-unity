#pragma strict

class EditorSelectionBox extends MonoBehaviour {
	public var lineMaterial : Material;
	public var wireframeMode : boolean = false;
	
	private var lines : Vector3[];
	private var linesArray : Array;
	
	function Fit ( obj : GameObject, wireframe : boolean ) {
		wireframeMode = wireframe;
		
		this.GetComponent(MeshRenderer).enabled = !wireframeMode;
		
		var skinnedMeshRenderer : SkinnedMeshRenderer = obj.GetComponentInChildren(SkinnedMeshRenderer);
		var meshFilter : MeshFilter = obj.GetComponentInChildren(MeshFilter);
		var useTransform : Transform;
		var mesh : Mesh;
		var newMesh : Mesh = new Mesh();
						
		if ( skinnedMeshRenderer ) {
			mesh = skinnedMeshRenderer.sharedMesh;
		
		} else if ( meshFilter ) {
			mesh = meshFilter.sharedMesh;	
		
		}
		
		newMesh.vertices = mesh.vertices;
		newMesh.triangles = mesh.triangles;
		
		if ( wireframe ) {
			linesArray = new Array();
					
		    var vertices = mesh.vertices;
		    var triangles = mesh.triangles;
		
		    for ( var i = 0; i < triangles.length / 3; i++) {
		        linesArray.Add(vertices[triangles[i * 3]]);
		        linesArray.Add(vertices[triangles[i * 3 + 1]]);
		        linesArray.Add(vertices[triangles[i * 3 + 2]]);
		    }
		
		    lines = linesArray.ToBuiltin(Vector3);
		
		} else {
			this.GetComponent(MeshFilter).sharedMesh = newMesh;
		
		}
	
		transform.localScale = obj.transform.localScale;
		transform.position = obj.transform.position;
		transform.localEulerAngles = obj.transform.localEulerAngles;
	}
	
	function OnRenderObject() {  
	    if ( wireframeMode ) {
		    lineMaterial.SetPass(0);
		
		    GL.PushMatrix();
		    GL.MultMatrix(transform.localToWorldMatrix);
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
		    GL.PopMatrix();
	    }
	}
}