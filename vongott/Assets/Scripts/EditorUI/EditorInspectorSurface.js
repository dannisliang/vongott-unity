#pragma strict

class EditorInspectorSurface extends MonoBehaviour {
	var previewImage : OGImage;
	var tilingValue : OGLabel;
	var materialButton : OGButton;
	@HideInInspector var selectedSurface : Surface;
	
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {			
		selectedSurface = obj.GetComponent ( Surface );
		tilingValue.text = selectedSurface.materialSize.ToString("f1");
		
		materialButton.func = function () {
			EditorBrowser.rootFolder = "Materials";
			EditorBrowser.initMode = "Use";
			EditorBrowser.callback = GetMaterial;
			OGRoot.GoToPage ( "Browser" );
		};
		
		materialButton.text = "";
		for ( var i = 0; i < selectedSurface.GetComponent(MeshRenderer).material.name.Length; i++ ) {
			if ( i < 12 ) {
				materialButton.text += selectedSurface.GetComponent(MeshRenderer).material.name[i];
			}
		}
		materialButton.text += "...";
		
		if ( selectedSurface.GetComponent(MeshRenderer).material.mainTexture ) {
			previewImage.image = selectedSurface.GetComponent(MeshRenderer).material.mainTexture;
		} else {
			previewImage.image = null;
		}
	}
	
	
	//////////////////////
	// Update
	//////////////////////
	function FlipNormals () {
		var filter : MeshFilter = selectedSurface.GetComponent(MeshFilter);
		
		if (filter != null) {
			var mesh : Mesh = filter.mesh;
 
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
	}
	
	function GetMaterial ( mat : Material ) {
		selectedSurface.GetComponent(MeshRenderer).material = mat;
	}
	
	function TileDown () {
		var val : float = float.Parse ( tilingValue.text );
		
		if ( val > 0.0 ) {
			val -= 0.1;
		}
		
		tilingValue.text = val.ToString("f1");
		
		UpdateObject ();
	}
	
	function TileUp () {
		var val : float = float.Parse ( tilingValue.text );
		
		if ( val < 10.0 ) {
			val += 0.1;
		}
		
		tilingValue.text = val.ToString("f1");
		
		UpdateObject ();
	}
	
	function UpdateObject () {
		if ( selectedSurface ) {
			selectedSurface.materialSize = float.Parse ( tilingValue.text );
			selectedSurface.Apply ();
		}
	}
}