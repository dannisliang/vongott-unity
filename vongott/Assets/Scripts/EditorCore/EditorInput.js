#pragma strict

////////////////////
// Prerequisites
////////////////////


////////////////////
// Static functions
////////////////////
// Update
static function Update () {
	// grab mode
	if ( EditorCore.grabMode ) {
		// esc key: go back
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			if ( EditorCore.grabRestrict == null ) {
				EditorCore.ToggleGrabMode();
			} else {
				EditorCore.ToggleRestriction ( null );
			}
		
		// X key: x axis
		} else if ( Input.GetKeyDown ( KeyCode.X ) ) {
			EditorCore.ToggleRestriction ( "x" );
			
		// Y key: y axis
		} else if ( Input.GetKeyDown ( KeyCode.Y ) ) {
			EditorCore.ToggleRestriction ( "y" );
			
		// Z key: z axis
		} else if ( Input.GetKeyDown ( KeyCode.Z ) ) {
			EditorCore.ToggleRestriction ( "z" );
			
		}
	
	// camera mode
	} else {	
		// tab key: toggle menu
		if ( Input.GetKeyDown ( KeyCode.Tab ) ) {
			EditorCore.menusActive = !EditorCore.menusActive;
		
		// Z key: wireframe toggle
		} else if ( Input.GetKeyDown ( KeyCode.Z ) ) {
			EditorCore.ToggleWireframe();
		
		// G key: grab mode
		} else if ( Input.GetKeyDown ( KeyCode.G ) ) {
			EditorCore.ToggleGrabMode();
		
		// X or delete key: delete item
		} else if ( Input.GetKeyDown ( KeyCode.Delete ) || Input.GetKeyDown ( KeyCode.X ) ) {
			EditorCore.DeleteSelected();
		
		// numpad 5: orthographic view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad5 ) ) {
			EditorCore.ToggleIsometric();
		
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
		
		// CTRL modifier
		} else if ( Input.GetKeyDown ( KeyCode.LeftControl ) ) {
			if ( Input.GetKeyDown ( KeyCode.S ) ) {
				if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
					return;
				} else {
					EditorCore.SaveFile ( EditorCore.currentLevel.name );
					return;
				}
			}
		}
	}
}