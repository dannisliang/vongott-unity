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
		selectedSurface.transform.localScale = new Vector3 ( selectedSurface.transform.localScale.x, -selectedSurface.transform.localScale.y, selectedSurface.transform.localScale.z );		
	}
	
	function GetMaterial ( matPath : String ) {
		Debug.Log ( matPath );
		selectedSurface.materialPath = matPath;
		selectedSurface.ReloadMaterial();
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