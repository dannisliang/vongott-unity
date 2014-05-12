#pragma strict

class SurveillanceCamera extends MonoBehaviour {
	enum eCameraTarget {
		Allies,
		Enemies,
		Everyone
	}
	
	public var target : eCameraTarget = eCameraTarget.Allies;
	public var cameraView : Camera;
	public var seeking : boolean = true;
	public var doorGUID : String = "";
	public var door : Door;
	
	private var t : float = 0;
	
	function Start () {
		if ( !cameraView ) {
			cameraView = this.gameObject.GetComponentInChildren ( Camera );
		}
		
		SetActive ( false );
	}

	public function SetActive ( state : boolean ) {
		cameraView.enabled = state;
	}

	public function SetTarget ( t : String ) {
		switch ( t ) {
			case "Allies": target = eCameraTarget.Allies; break;
			case "Enemies": target = eCameraTarget.Enemies; break;
			case "Everyone": target = eCameraTarget.Everyone; break;
		}
	}

	function Update () {
		if ( !GameCore.running ) {
			if ( cameraView.enabled ) { cameraView.enabled = false; }
			return;
		}
		
		if ( !door && doorGUID != "" ) {
			var obj : GameObject = GameCore.GetObjectFromGUID ( doorGUID );
			
			if ( obj ) {
				door = obj.GetComponent(Door);
			}
		}
		
		if ( seeking ) {		
			t = Mathf.PingPong(Time.time * 0.2, 1.0);
			cameraView.transform.parent.localRotation = Quaternion.Slerp ( Quaternion.Euler(0,-45,0), Quaternion.Euler(0,45,0), t);
		}
	}
}
