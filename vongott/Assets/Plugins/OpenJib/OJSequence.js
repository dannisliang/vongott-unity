#pragma strict

import System.Collections.Generic;

public class OJKeyframe {
	public class Curve {
		public var symmetrical : boolean = false;
		public var before : Vector3;
		public var after : Vector3;
	}

	public class Event {
		public var action : System.Action;
		public var message : String;
		public var argument : String;
		public var fired : boolean = false;

		public function Fire ( eventHandler : GameObject ) {
			if ( !Application.isPlaying ) { return; }
			
			if ( action ) {
				action ();
			
			} else if ( eventHandler && !String.IsNullOrEmpty ( message ) ) {
				if ( !String.IsNullOrEmpty ( argument ) ) {
					eventHandler.SendMessage ( message, argument, SendMessageOptions.DontRequireReceiver );

				} else {
					eventHandler.SendMessage ( message, SendMessageOptions.DontRequireReceiver );

				}
			}

			fired = true;
		}	
	}

	public var time : float = 0;
	public var stop : boolean;
	public var event : Event = new Event ();
	public var position : Vector3;
	public var rotation : Vector3;
	public var curve : Curve = new Curve ();
	public var fov : int = 60;
	public var brightness : float = 1;

	public function Focus ( cam : Transform, target : Transform ) {
		var lookPos : Vector3 = target.position - cam.position;
		lookPos.y = 0;
		
		rotation = Quaternion.LookRotation ( lookPos ).eulerAngles;
	}
	
	public function MirrorCurveBefore () {
		curve.before = -curve.after;
	}
	
	public function MirrorCurveAfter () {
		curve.after = -curve.before;
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

	public var cameraTag : String = "SequenceCamera";
	public var autoPlay : boolean = false;	
	public var rotateAlongCurve : boolean = false;
	public var keyframes : List.< OJKeyframe > = new List.< OJKeyframe > (); 
	public var cam : Camera;
	public var length : float = 30;
	public var currentTime : float;
	public var playing : boolean = false;
	public var eventHandler : GameObject;

	private var fadeTex : Texture2D;	
	private var fadePlane : GameObject;
	private var fadeMaterial : Material; 

	private function get isReady () : boolean {
		return Application.isPlaying && cam != null && keyframes.Count > 0;
	}

	public static function CalculateBezierPoint ( t : float, p0 : Vector3, p1 : Vector3, p2 : Vector3, p3 : Vector3 ) : Vector3 {
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
	
	public function Play () {
		if ( isReady ) {
			cam.enabled = true;
			playing = true;
			
			for ( var kf : OJKeyframe in keyframes ) {
				kf.event.fired = false;
			}
		}
	}

	public function Reset () {
		currentTime = 0;

		for ( var kf : OJKeyframe in keyframes ) {
			kf.event.fired = false;
		}
	}

	public function Start () {
		if ( autoPlay ) {
			Play ();
		
		} else {
			if ( !cam ) {
				var go : GameObject = GameObject.FindWithTag ( cameraTag );
				cam = go.GetComponent.< Camera > ();
			}
			
			if ( cam ) {
				cam.enabled = false;
			}
		}
	}

	public function Stop () {
		playing = false;
		cam.enabled = false;
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

	public function LerpCamera ( kf1 : OJKeyframe, kf2 : OJKeyframe, t : float ) {
		cam.fieldOfView = Mathf.Lerp ( kf1.fov, kf2.fov, t );
		cam.transform.position = CalculateBezierPoint ( t, transform.position + kf1.position, transform.position + kf1.position + kf1.curve.after, transform.position + kf2.position + kf2.curve.before, transform.position + kf2.position );

		if ( rotateAlongCurve ) {
			cam.transform.LookAt ( CalculateBezierPoint ( t + 0.05, transform.position + kf1.position, transform.position + kf1.position + kf1.curve.after, transform.position + kf2.position + kf2.curve.before, transform.position + kf2.position ) );

		} else {
			cam.transform.localRotation = Quaternion.Lerp ( Quaternion.Euler ( kf1.rotation ), Quaternion.Euler ( kf2.rotation ), t ); 
		
		}
		
		var alpha : float = 1 - ( Mathf.Lerp ( kf1.brightness, kf2.brightness, t ) );
		fadeTex.SetPixels ( [ 
			new Color ( 0, 0, 0, alpha ),
			new Color ( 0, 0, 0, alpha ),
			new Color ( 0, 0, 0, alpha ),
			new Color ( 0, 0, 0, alpha )
		] );
		fadeTex.Apply ();
		
	}	

	public function SetCamera ( kf : OJKeyframe ) {
		cam.fieldOfView = kf.fov;
		
		fadeTex.SetPixels ( [ 
			new Color ( 0, 0, 0, 1 - kf.brightness ),
			new Color ( 0, 0, 0, 1 - kf.brightness ),
			new Color ( 0, 0, 0, 1 - kf.brightness ),
			new Color ( 0, 0, 0, 1 - kf.brightness )
		] );
		fadeTex.Apply ();
		
		cam.transform.position = transform.position + kf.position;
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
			//kf = closest.kf1;

		} else if ( closest.kf2 ) {
			//kf = closest.kf2;

		}

		kf.time = time;
		
		keyframes.Add ( kf );

		// Return the correct index
		for ( i = 0; i < keyframes.Count; i++ ) {
			if ( keyframes [ i ].time == time ) {
				return i;
			}
		}

		return 0;
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
		if ( !fadePlane ) {
			fadePlane = GameObject.CreatePrimitive ( PrimitiveType.Quad );
			fadePlane.transform.parent = cam.transform;
			fadePlane.transform.localPosition = new Vector3 ( 0, 0, cam.nearClipPlane + 0.1 );
			fadePlane.transform.localEulerAngles = new Vector3 ( 0, 0, 0 );

			fadeTex = new Texture2D ( 2, 2 );
			fadeTex.SetPixels ( [
				new Color ( 0, 0, 0, 0 ),
				new Color ( 0, 0, 0, 0 ),
				new Color ( 0, 0, 0, 0 ),
				new Color ( 0, 0, 0, 0 )
			] );
			fadeTex.Apply ();
			
			fadeMaterial = new Material ( Shader.Find ( "Unlit/Transparent" ) );
			fadeMaterial.mainTexture = fadeTex;
			
			fadePlane.GetComponent.< MeshRenderer > ().material = fadeMaterial;
		
		} else {
			fadePlane.transform.localScale = new Vector3 ( cam.fieldOfView / 60, cam.fieldOfView / 60, cam.fieldOfView / 60 );

		}

		currentTime = time;

		var closest : KeyframePair = FindClosestKeyframes ();
	
		// Fire event
		if ( Application.isPlaying && playing && closest.kf1 && !closest.kf1.event.fired ) {
			closest.kf1.event.Fire ( eventHandler );
		}

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

			if ( currentTime > length ) {
				Stop ();
			
			} else {			
				SetTime ( currentTime );
			
			}
		}
	}
}
