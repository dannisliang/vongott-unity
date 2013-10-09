#pragma strict

class UITerminalDisplay extends OGPage {
	public static var currentCameras : SurveillanceCamera[];
	
	public var cameraWindows : OGCameraWindow[] = new OGCameraWindow[3];
	
	public function ToggleCamera ( n : String ) {
		var i : int = int.Parse ( n );
	
		if ( currentCameras[i] ) {
			currentCameras[i].seeking = !currentCameras[i].seeking;
		}
	}
	
	override function StartPage () {
		for ( var i = 0; i < currentCameras.Length; i++ ) {
			if ( currentCameras[i] ) {
				cameraWindows[i].transform.parent.gameObject.SetActive ( true );
				cameraWindows[i].targetCamera = currentCameras[i].cameraView;
			
			} else {
				cameraWindows[i].transform.parent.gameObject.SetActive ( false );
			
			}
		}
	}
	
	override function UpdatePage () {
	
	}
}