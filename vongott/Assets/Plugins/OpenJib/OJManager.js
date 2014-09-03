#pragma strict

import DG.Tweening;

public class OJManager extends MonoBehaviour {
	public var sequences : List.< OJSequence > = new List.< OJSequence > ();

	private var currentSequence : int;
	private var currentKeyframe : int;

	private function get keyframes () : List.< OJKeyframe > {
		if ( sequences.Count < 1 ) {
			sequences.Add ( new OJSequence () );
		}
		
		return sequences [ currentSequence ].keyframes;
	}
	
	private function get isReady () : boolean {
		return camera != null && keyframes.Count > 0 && currentKeyframe < keyframes.Count;
	}
	
	public function Start () {
		if ( !camera ) {
			this.gameObject.AddComponent.< Camera > ();
		}
		
		camera.depth = Camera.main.depth + 10;
		camera.enabled = false;
	}

	public function SortSequences () {
		sequences.Sort ( function ( a : OJSequence, b : OJSequence ) {
			return a.name.CompareTo ( b.name );
		} );
	}

	public function PlayNextKeyframe () {
		currentKeyframe++;

		if ( !keyframes [ currentKeyframe ].stop ) {
			PlayCurrentKeyframe ();
		}
	}

	public function SetPosition ( value : Vector3 ) {
		camera.transform.position = value;
	}

	public function GetPosition () : Vector3 {
		return camera.transform.position;
	}

	public function PlayCurrentKeyframe () {
		if ( isReady && currentKeyframe < keyframes.Count - 1 ) {
			var thiskf : OJKeyframe = keyframes [ currentKeyframe ];
			var nextkf : OJKeyframe = keyframes [ currentKeyframe + 1 ];
			var c : Camera = camera;

			var moveTween : Tween = DOTween.To (
				GetPosition,
				SetPosition,
				nextkf.position,
				thiskf.time
			);

			moveTween.SetEase ( thiskf.easing );
		}
	}

	public function Play () {
		Play ( currentSequence );
	}

	public function Play ( sequence : int ) {
		currentSequence = sequence;

		if ( isReady ) {
			camera.enabled = true;
			PlayCurrentKeyframe ();
		}
	}

	public function Reset () {
		currentKeyframe = 0;
	}

	public function Stop () {
	}

	public function Exit () {
		camera.enabled = false;
	}
}
