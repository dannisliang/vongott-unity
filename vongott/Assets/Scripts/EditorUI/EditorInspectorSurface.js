#pragma strict

class EditorInspectorSurface extends MonoBehaviour {
	var tilingValue : OGLabel;
	@HideInInspector var selectedSurface : Surface;
	
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {			
		selectedSurface = obj.GetComponent ( Surface );
		tilingValue.text = selectedSurface.planes[0].materialSize.ToString("f1");
	}
	
	
	//////////////////////
	// Update
	//////////////////////
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