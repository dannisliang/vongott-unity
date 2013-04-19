#pragma strict

////////////////////
// Prerequisites
////////////////////


////////////////////
// Static functions
////////////////////
// Update
static function Update () {
	// tab key: toggle menu
	if ( Input.GetKeyDown ( KeyCode.Tab ) ) {
		EditorCore.menusActive = !EditorCore.menusActive;
	
	// Z key: wireframe toggle
	} else if ( Input.GetKeyDown ( KeyCode.Z ) ) {
		GL.wireframe = !GL.wireframe;
	
	// numpad 5: orthographic view
	} else if ( Input.GetKeyDown ( KeyCode.Keypad5 ) ) {
		Camera.main.orthographic = !Camera.main.orthographic;
		Camera.main.orthographicSize = 50;
	
	// numpad 7: top view
	} else if ( Input.GetKeyDown ( KeyCode.Keypad7 ) ) {
		Camera.main.transform.localEulerAngles = new Vector3 ( 90.0, 0.0, 0.0 );
		Camera.main.transform.localPosition = new Vector3 ( 0.0, 500.0, 0.0 );
	
	// numpad 3: left view
	} else if ( Input.GetKeyDown ( KeyCode.Keypad3 ) ) {
		Camera.main.transform.localEulerAngles = new Vector3 ( 0.0, 90.0, 0.0 );
		Camera.main.transform.localPosition = new Vector3 ( -500.0, 0.0, 0.0 );
	
	// numpad 1: front
	} else if ( Input.GetKeyDown ( KeyCode.Keypad1 ) ) {
		Camera.main.transform.localEulerAngles = new Vector3 ( 0.0, 0.0, 0.0 );
		Camera.main.transform.localPosition = new Vector3 ( 0.0, 0.0, -500.0 );
	
	}
}