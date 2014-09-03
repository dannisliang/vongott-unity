#pragma strict

import DG.Tweening;

public class OJKeyframe {
	// Transform
	public var position : Vector3;
	public var rotation : Vector3;
	
	// Properties
	public var fov : int = 60;
	public var brightness : float = 1;
	public var wait : float = 1;
	public var stop : boolean;
	
	// Next tween
	public var time : float = 1;
	public var easing : DG.Tweening.Ease;

	public function Focus ( cam : Transform, target : Transform ) {
		var lookPos : Vector3 = target.position - cam.position;
		lookPos.y = 0;
		
		rotation = Quaternion.LookRotation ( lookPos ).eulerAngles;
	}
}

public class OJSequence extends MonoBehaviour {
	public var keyframes : List.< OJKeyframe > = new List.< OJKeyframe > (); 
	public var cam : Camera;

	@HideInInspector public var currentKeyframe : int;

	private function get isReady () : boolean {
		return Application.isPlaying && cam != null && keyframes.Count > 0 && currentKeyframe < keyframes.Count;
	}
	
	public function PlayNextKeyframe () {
		currentKeyframe++;

		if ( !keyframes [ currentKeyframe ].stop ) {
			PlayCurrentKeyframe ();
		}
	}

	// Frame functions
	public function SetKeyframePose ( i : int ) {
		var kf : OJKeyframe = keyframes [ i ];
		
		SetPosition ( kf.position );
		SetRotation ( kf.rotation );
	}

	// Tween functions
	public function SetPosition ( value : Vector3 ) {
		cam.transform.position = value;
	}

	public function GetPosition () : Vector3 {
		return cam.transform.position;
	}

	public function SetRotation ( value : Vector3 ) {
		cam.transform.localRotation = Quaternion.Euler ( value );
	}

	public function GetRotation () : Vector3 {
		return cam.transform.localEulerAngles;
	}

	public function PlayCurrentKeyframe () {
		if ( isReady && currentKeyframe < keyframes.Count - 1 ) {
			var thiskf : OJKeyframe = keyframes [ currentKeyframe ];
			var nextkf : OJKeyframe = keyframes [ currentKeyframe + 1 ];

			var moveTween : DG.Tweening.Tween = DOTween.To (
				GetPosition,
				SetPosition,
				nextkf.position,
				thiskf.time
			);
			
			var rotateTween : DG.Tweening.Tween = DOTween.To (
				GetRotation,
				SetRotation,
				nextkf.rotation,
				thiskf.time
			);

			rotateTween.SetEase ( thiskf.easing );
			moveTween.SetEase ( thiskf.easing );
		}
	}

	public function Play () {
		if ( isReady ) {
			cam.enabled = true;
			PlayCurrentKeyframe ();
		}
	}

	public function Reset () {
		currentKeyframe = 0;

		SetPosition ( keyframes [ currentKeyframe ].position );
		SetRotation ( keyframes [ currentKeyframe ].rotation );
	}

	public function Start () {
		cam.enabled = false;
	}

	public function Stop () {
	
	}

	public function Exit () {
		cam.enabled = false;
	}
}
