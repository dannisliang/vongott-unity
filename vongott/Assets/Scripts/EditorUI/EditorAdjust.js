#pragma strict

class EditorAdjust extends OGPage {
	var title : OGLabel;
	
	var x : OGTextField;
	var y : OGTextField;
	var z : OGTextField;
	
	static var adjust : String = "position";
	
	override function StartPage () {		
		title.text = "Adjust " + adjust;
		
		var currentVector : Vector3;
		
		if ( adjust == "position" ) {
			currentVector = EditorCore.GetSelectedObject().transform.localPosition;
		} else if ( adjust == "rotation" ) {
			currentVector = EditorCore.GetSelectedObject().transform.localEulerAngles;
		} else if ( adjust == "scale" ) {
			currentVector = EditorCore.GetSelectedObject().transform.localScale;
		}
	
		x.text = currentVector.x.ToString("f1");
		y.text = currentVector.y.ToString("f1");
		z.text = currentVector.z.ToString("f1");
	}
	
	function OK () {
		var newX = float.Parse ( x.text );
		var newY = float.Parse ( y.text );
		var newZ = float.Parse ( z.text );
		
		if ( adjust == "position" ) {
			EditorCore.GetSelectedObject().transform.localPosition = new Vector3 ( newX, newY, newZ );
		} else if ( adjust == "rotation" ) {
			EditorCore.GetSelectedObject().transform.localEulerAngles = new Vector3 ( newX, newY, newZ );
		} else if ( adjust == "scale" ) {
			EditorCore.GetSelectedObject().transform.localScale = new Vector3 ( newX, newY, newZ );
		}
		
		OGRoot.GoToPage ( "MenuBase" );
		EditorCore.SelectObject ( EditorCore.GetSelectedObject() );
	}
	
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
		EditorCore.SelectObject ( EditorCore.GetSelectedObject() );
	}
}