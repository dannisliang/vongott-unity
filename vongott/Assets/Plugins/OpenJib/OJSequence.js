#pragma strict

import DG.Tweening;

public class OJKeyframe {
	public class Curve {
		public var before : Vector3;
		public var after : Vector3;
	}

	// Transform
	public var position : Vector3;
	public var rotation : Vector3;
	public var curve : Curve = new Curve ();
	
	// Properties
	public var fov : int = 60;
	public var brightness : float = 1;
	public var time : float = 0;
	public var stop : boolean;

	// Next tween
	public function Focus ( cam : Transform, target : Transform ) {
		var lookPos : Vector3 = target.position - cam.position;
		lookPos.y = 0;
		
		rotation = Quaternion.LookRotation ( lookPos ).eulerAngles;
	}
}

public class OJSequence extends MonoBehaviour {
	private class KeyframePair {
		public var kf1 : OJKeyframe;
		public var kf2 : OJKeyframe;

		function KeyframePair ( kf1 : OJKeyframe, kf2 : OJKeyframe ) {
			this.kf1 = kf1;
			this.kf2 = kf2;
		}
	}
	
	public var keyframes : List.< OJKeyframe > = new List.< OJKeyframe > (); 
	public var cam : Camera;
	public var length : float = 30;

	@HideInInspector public var currentTime : float;
	@HideInInspector public var playing : boolean = false;

	private function get isReady () : boolean {
		return Application.isPlaying && cam != null && keyframes.Count > 0;
	}

	private static function CalculateBezierPoint ( t : float, p0 : Vector3, p1 : Vector3, p2 : Vector3, p3 : Vector3 ) : Vector3 {
		var u : float = 1 - t;
		var tt : float = t*t;
	  	var uu : float = u*u;
	  	var uuu : float = uu * u;
	  	var ttt : float = tt * t;
	 
	  	var p : Vector3 = uuu * p0;
	  	p += 3 * uu * t * p1;
	  	p += 3 * u * tt * p2;
	  	p += ttt * p3;
	 
	  	return p;
	}	
	
	public function SortKeyframes () {
		keyframes.Sort ( function ( a : OJKeyframe, b : OJKeyframe ) {
			a.time.CompareTo ( b.time );
		} );
	}

	public function Play () {
		if ( isReady ) {
			cam.enabled = true;
			playing = true;
		}
	}

	public function Reset () {
		currentTime = 0;

		var kf : OJKeyframe = keyframes [ 0 ];
	
		cam.transform.localPosition = kf.position;
		cam.transform.localEulerAngles = kf.rotation;
	}

	public function Start () {
		cam.enabled = false;
	}

	public function Stop () {
		playing = false;
	}

	public function Exit () {
		cam.enabled = false;
	}

	public function RemoveKeyframe ( i : int ) {
		keyframes.RemoveAt ( i );
	}
	
	public function LerpKeyframe ( kf : OJKeyframe, kf1 : OJKeyframe, kf2 : OJKeyframe, percent : float ) {
		kf.position = Vector3.Lerp ( kf1.position, kf2.position, percent ); 
	}	

	private static function LinearTween ( t : float, b : float, c : float, d : float ) {
		return c * t / d + b;
	}
	
	private static function EaseInTween ( t : float, b : float, c : float, d : float ) {
		t /= d;
		return c*t*t + b;
	}

	public function LerpCamera ( kf1 : OJKeyframe, kf2 : OJKeyframe, t : float ) {
		//t = LinearTween ( t, 0, 1, kf2.time - kf1.time );
		//t = EaseInTween ( t, 0, 1, kf2.time - kf1.time );
		
		cam.transform.localPosition = CalculateBezierPoint ( t, kf1.position, kf1.position + kf1.curve.after, kf2.position + kf2.curve.before, kf2.position );
		cam.transform.localRotation = Quaternion.Lerp ( Quaternion.Euler ( kf1.rotation ), Quaternion.Euler ( kf2.rotation ), t ); 
	}	

	public function SetCamera ( kf : OJKeyframe ) {
		cam.transform.localPosition = kf.position;
		cam.transform.localRotation = Quaternion.Euler ( kf.rotation );
	}

	public function AddKeyframe ( time : float ) : int {
		// Check if keyframe exists at the given time
		for ( var i : int = 0; i < keyframes.Count; i++ ) {
			if ( keyframes [ i ].time == time ) {
				return i;
			}
		}

		// Create new keyframe
		var kf : OJKeyframe = new OJKeyframe ();
		var closest : KeyframePair = FindClosestKeyframes ();
		
		
		if ( closest.kf1 && closest.kf2 ) {
			var cursor : float = GetCursorPosition ( closest.kf1, closest.kf2 );
			LerpKeyframe ( kf, closest.kf1, closest.kf2, cursor );
		
		} else if ( closest.kf1 ) {
			kf = closest.kf1;

		} else if ( closest.kf2 ) {
			kf = closest.kf2;

		}

		kf.time = time;
		
		keyframes.Add ( kf );
		SortKeyframes ();
		
		// Return the correct index
		for ( i = 0; i < keyframes.Count; i++ ) {
			if ( keyframes [ i ].time == time ) {
				return i;
			}
		}
	}

	public function GetCursorPosition ( kf1 : OJKeyframe, kf2 : OJKeyframe ) : float {
		var min : float = kf1.time;
		var cursor : float = currentTime;
		var max : float = kf2.time;
		
		return ( cursor - min ) / ( max - min );
	}

	public function FindClosestKeyframes () : KeyframePair {
		var kf1 : OJKeyframe;
		var kf2 : OJKeyframe;
	
		for ( var i : int = 0; i < keyframes.Count; i++ ) {
			var kf : OJKeyframe = keyframes [ i ];

			if ( kf.time == currentTime || ( kf.time < currentTime && ( kf1 == null || Mathf.Abs ( kf.time - currentTime ) < Mathf.Abs ( kf1.time - currentTime ) ) ) ) {
				kf1 = kf;
			
			} else if ( kf.time > currentTime && ( kf2 == null || Mathf.Abs ( kf.time - currentTime ) < Mathf.Abs ( kf2.time - currentTime ) ) ) {
				kf2 = kf;

			}
		}

		return new KeyframePair ( kf1, kf2 );
	}

	public function SetTime ( time : float ) {
		currentTime = time;

		var closest : KeyframePair = FindClosestKeyframes ();
	
		if ( closest.kf1 ) {
			if ( closest.kf2 ) { 
				LerpCamera ( closest.kf1, closest.kf2, GetCursorPosition ( closest.kf1, closest.kf2 ) ); 
			
			} else {
				SetCamera ( closest.kf1 ); 

			}
		}	
	}

	public function Update () {
		if ( playing ) {
			currentTime += Time.deltaTime;

			if ( currentTime >= length ) {
				playing = false;
			
			} else {			
				SetTime ( currentTime );
			
			}
		}
	}

	public function OnDrawGizmosSelected () {
		if ( keyframes.Count > 1 ) {
			for ( var k : int = 1; k < keyframes.Count; k++ ) {
				var kf1 : OJKeyframe = keyframes [ k - 1 ];
				var kf2 : OJKeyframe = keyframes [ k ];

				for ( var t : float = 0.1; t <= 1; t += 0.1 ) {
					var p1 : Vector3 = CalculateBezierPoint ( t - 0.1, kf1.position, kf1.position + kf1.curve.after, kf2.position + kf2.curve.before, kf2.position );
					var p2 : Vector3 = CalculateBezierPoint ( t, kf1.position, kf1.position + kf1.curve.after, kf2.position + kf2.curve.before, kf2.position );
					
					Gizmos.DrawLine ( p1, p2 );
				}
			}
		}
	}
}
