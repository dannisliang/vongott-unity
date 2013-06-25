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
		tilingValue.text = selectedSurface.planes[0].materialSize.ToString("f1");
		
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
			for ( var plane : SurfacePlane in selectedSurface.planes ) {
				plane.materialSize = float.Parse ( tilingValue.text );
			}
			selectedSurface.Apply ();
		}
	}
}