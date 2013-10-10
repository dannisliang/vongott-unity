#pragma strict

class UITerminalDisplay extends OGPage {
	public static var currentCameras : SurveillanceCamera[];
	
	public var cameraWindows : OGCameraWindow[] = new OGCameraWindow[3];
	public var targetControls : OGPopUp[] = new OGPopUp[3];
	public var doorControls : OGTickBox[] =  new OGTickBox[3];
	
	public function ToggleCamera ( n : String ) {
		var i : int = int.Parse ( n );
	
		if ( currentCameras[i] ) {
			currentCameras[i].seeking = !currentCameras[i].seeking;
		}
	}
	
	public function UpdateCameras () {
		for ( var i = 0; i < currentCameras.Length; i++ ) {
			if ( currentCameras[i] ) {
				currentCameras[i].SetTarget ( targetControls[i].selectedOption );
				
				if ( currentCameras[i].door ) {
					currentCameras[i].door.locked = doorControls[i].isChecked;
				}			
			}
		}
	}
	
	override function StartPage () {
		for ( var i = 0; i < currentCameras.Length; i++ ) {
			if ( currentCameras[i] ) {
				currentCameras[i].SetActive ( true );
				
				cameraWindows[i].transform.parent.gameObject.SetActive ( true );
				cameraWindows[i].targetCamera = currentCameras[i].cameraView;
				targetControls[i].selectedOption = currentCameras[i].target.ToString();
				
				if ( currentCameras[i].door ) {
					doorControls[i].gameObject.SetActive ( true );
					doorControls[i].isChecked = currentCameras[i].door.locked;
				} else {
					doorControls[i].gameObject.SetActive ( false );
				}
			
			} else {
				cameraWindows[i].transform.parent.gameObject.SetActive ( false );
			
			}
		}
	}
	
	override function UpdatePage () {
		UpdateCameras ();
	}
	
	override function ExitPage () {		
		for ( var i = 0; i < currentCameras.Length; i++ ) {
			if ( currentCameras[i] ) {
				currentCameras[i].SetActive ( false );			
			}
		}
	}
}