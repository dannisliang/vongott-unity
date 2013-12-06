#pragma strict

class EditorInspectorSurface extends MonoBehaviour {
	var previewImage : OGTexture;
	var tilingValue : OGLabel;
	var materialButton : OGButton;
	
	var foliagePreview : OGTexture;
	var foliageDensity : OGLabel;
	var foliageSource : OGButton;
	
	@HideInInspector var selectedSurface : Surface;
	
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {			
		selectedSurface = obj.GetComponent ( Surface );
		
		// Material
		tilingValue.text = selectedSurface.materialSize.ToString("f1");
				
		materialButton.func = function () {
			EditorBrowserWindow.rootFolder = "Materials";
			EditorBrowserWindow.initMode = "Use";
			EditorBrowserWindow.callback = GetMaterial;
			OGRoot.GetInstance().GoToPage ( "BrowserWindow" );
		};
		
		materialButton.text = "";
		for ( var i = 0; i < selectedSurface.GetComponent(MeshRenderer).material.name.Length; i++ ) {
			if ( i < 12 ) {
				materialButton.text += selectedSurface.GetComponent(MeshRenderer).material.name[i];
			}
		}
		materialButton.text += "...";
		
		if ( selectedSurface.GetComponent(MeshRenderer).material.mainTexture ) {
			previewImage.image = selectedSurface.GetComponent(MeshRenderer).material.mainTexture as Texture2D;
		} else {
			previewImage.image = null;
		}
		
		// Foliage
		foliageDensity.text = selectedSurface.foliageDensity.ToString("f1");
				
		foliageSource.func = function () {
			EditorBrowserWindow.rootFolder = "Foliage";
			EditorBrowserWindow.initMode = "Use";
			EditorBrowserWindow.callback = GetFoliage;
			OGRoot.GetInstance().GoToPage ( "BrowserWindow" );
		};
		
		foliageSource.text = "";
		for ( i = 0; i < selectedSurface.foliagePath.Length; i++ ) {
			if ( i < 12 ) {
				foliageSource.text += selectedSurface.foliagePath[i];
			}
		}
		foliageSource.text += "...";
		
		if ( selectedSurface.foliagePath != "" ) {
			foliagePreview.image = ( Resources.Load ( selectedSurface.foliagePath ) as Material ).mainTexture as Texture2D;
		} else {
			foliagePreview.image = null;
		}
	}
	
	
	//////////////////////
	// Operations
	//////////////////////
	function FlipNormals () {
		selectedSurface.transform.localScale = new Vector3 ( selectedSurface.transform.localScale.x, -selectedSurface.transform.localScale.y, selectedSurface.transform.localScale.z );		
	}
	
	
	//////////////////////
	// Foliage
	//////////////////////
	function PickFoliage () {
		
	}
	
	function GetFoliage ( folPath : String ) {
		selectedSurface.foliagePath = "Foliage" + folPath;
		selectedSurface.ReloadFoliage();
	}
	
	function DensityDown () {
		var val : float = float.Parse ( foliageDensity.text );
		
		if ( val > 0.0 ) {
			val -= 0.1;
		}
		
		foliageDensity.text = val.ToString("f1");
		
		UpdateObject ();
	}
	
	function DensityUp () {
		var val : float = float.Parse ( foliageDensity.text );
		
		if ( val < 10.0 ) {
			val += 0.1;
		}
		
		foliageDensity.text = val.ToString("f1");
		
		UpdateObject ();
	}
	
	
	//////////////////////
	// Material
	//////////////////////
	function GetMaterial ( matPath : String ) {
		selectedSurface.materialPath = matPath;
		selectedSurface.ReloadMaterial();
	}
	
	function PickMaterial () {
		EditorCore.SetPickMode ( true );
		
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
			selectedSurface.foliageDensity = float.Parse ( foliageDensity.text );
			selectedSurface.Apply ();
		}
	}
}