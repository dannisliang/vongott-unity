#pragma strict

class EditorModes extends OGPage {
	var _title : OGLabel;
	var _message : OGLabel;
	var _background : OGRect;
	var _data : Transform;
	
	var dataX : OGLabel;
	var dataY : OGLabel;
	var dataZ : OGLabel;
	var dataVector : Vector3;
																	
	static var title : OGLabel;
	static var message : OGLabel;
	static var background : OGRect;
	static var data : Transform;
	static var callback : Function;
	
	static function SetTitle ( ttl : String ) {
		title.text = ttl;
		data.gameObject.SetActive ( ttl != "Pick Mode" && ttl != "First Person Mode" );
		Camera.main.GetComponent(EditorCamera).locked = ttl != "Pick Mode" && ttl != "First Person Mode";
	}
	
	static function SetMessage ( msg : String ) {
		message.text = msg;
	}
	
	static function SetHeight ( h : float ) {
		background.transform.localScale = new Vector3 ( background.transform.localScale.x, h, background.transform.localScale.z );
	
		data.localPosition = new Vector3 ( data.localPosition.x, h - 25, data.localPosition.z );
	}
	
	override function UpdatePage () {
		if ( title.text == "Grab Mode" ) {
			dataVector = EditorCore.GetSelectedObject().transform.localPosition;	
		} else if ( title.text == "Rotate Mode" ) {
			dataVector = EditorCore.GetSelectedObject().transform.localEulerAngles;
		} else if ( title.text == "Scale Mode" ) {
			dataVector = EditorCore.GetSelectedObject().transform.localScale;
		}
	
		dataX.text = "X: " + dataVector.x.ToString("f2");
		dataY.text = "Y: " + dataVector.y.ToString("f2");
		dataZ.text = "Z: " + dataVector.z.ToString("f2");
	}
	
	override function StartPage () {
		title = _title;
		message = _message;
		background = _background;
		data = _data;
	}
}