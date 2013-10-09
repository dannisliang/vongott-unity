#pragma strict

class SurveillanceCamera extends MonoBehaviour {
	enum eCameraTarget {
		Allies,
		Enemies
	}
	
	public var target : eCameraTarget = eCameraTarget.Allies;
	public var cameraView : Camera;
	public var seeking : boolean = true;
	
	private var t : float = 0;
	
	function Start () {
		if ( !cameraView ) {
			cameraView = this.gameObject.GetComponentInChildren ( Camera );
		}
	}

	function Update () {
		if ( seeking ) {		
			t = Mathf.PingPong(Time.time * 0.2, 1.0);
			cameraView.transform.localRotation = Quaternion.Slerp ( Quaternion.Euler(0,-45,0), Quaternion.Euler(0,45,0), t);
		}
	}
}