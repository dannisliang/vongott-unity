#pragma strict

public class OJSequenceEditor extends OGPage {
	public var linLeft : Transform;
	public var linRight : Transform;
	public var fldCursorInput : OGTextField;
	public var fldSequenceLength : OGTextField;
	public var timestepContainer : Transform;
	public var keyframeContainer : Transform;
	public var tbxFollowCurve : OGTickBox;
	public var tbxAutoplay : OGTickBox;
	public var sequenceCamera : Camera;
	public var timeline : OGScrollView;
	public var cursor : Transform;
	public var sldScale : OGSlider;
	public var timelineScale : float = 20;

	private var currentTime : float;

	public static var sequence : OJSequence;
	public static var currentKeyframe : int;

	public function ReadSequence () {
		
	}

	public function SelectKeyframe ( n : String ) {
		currentKeyframe = int.Parse ( n );

		ReadKeyframe ();
	}

	public function DeleteKeyframe () {
		sequence.keyframes.RemoveAt ( currentKeyframe );
	}

	public function AddKeyframe () {
		currentKeyframe = sequence.AddKeyframe ( currentTime );
	}

	public function ReadKeyframe () {
	}
	
	private function UpdateTimestepLabels () {
		for ( var i : int = 0; i <= sequence.length; i++ ) {
			var lbl : OGLabel;
		       
			if ( i < timestepContainer.childCount ) {
				lbl = timestepContainer.GetChild ( i ).gameObject.GetComponent.< OGLabel > ();
			} else {
				lbl = new GameObject ( i.ToString () ).AddComponent.< OGLabel > ();
				lbl.ApplyDefaultStyles ();
				lbl.transform.parent = timestepContainer;
			}
			
			lbl.text = i.ToString ();
			lbl.pivot.x = RelativeX.Center;
			lbl.overrideAlignment = true;
			lbl.alignment = TextAnchor.UpperCenter;

			lbl.transform.localScale = new Vector3 ( 20, 14, 1 );
			lbl.transform.localPosition = new Vector3 ( i * timelineScale, 0, 0 );
		}

		for ( i = sequence.length + 1; i < timestepContainer.childCount; i++ ) {
			DestroyImmediate ( timestepContainer.GetChild ( i ).gameObject );
		}
	}

	private function UpdateKeyframeButtons () {
		for ( var i : int = 0; i < sequence.keyframes.Count; i++ ) {
			var btn : OGButton;
		       
			if ( i < keyframeContainer.childCount ) {
				btn = keyframeContainer.GetChild ( i ).gameObject.GetComponent.< OGButton > ();
			} else {
				btn = new GameObject ( i.ToString () ).AddComponent.< OGButton > ();
				btn.ApplyDefaultStyles ();
				btn.transform.parent = keyframeContainer;
			}

			var kf : OJKeyframe = sequence.keyframes [ i ];
			btn.target = this.gameObject;
			btn.message = "SelectKeyframe";
			btn.argument = i.ToString ();
			btn.tint = i == currentKeyframe ? Color.green : Color.white;

			btn.transform.localScale = new Vector3 ( 10, 20, 1 );
			btn.transform.localPosition = new Vector3 ( kf.time * timelineScale - 5, 0, 0 );
		}

		for ( i = sequence.keyframes.Count; i < keyframeContainer.childCount; i++ ) {
			Destroy ( keyframeContainer.GetChild ( i ).gameObject );
		}
	}

	override function StartPage () {
		sequenceCamera.enabled = true;
		
		fldSequenceLength.text = sequence.length.ToString();
		fldCursorInput.text = currentTime.ToString();
		tbxAutoplay.isTicked = sequence.autoPlay;
		tbxFollowCurve.isTicked = sequence.rotateAlongCurve;
	}

	override function ExitPage () {
		sequenceCamera.enabled = false;
	}

	public function Update () {
	       	timelineScale = 20 + sldScale.sliderValue * 100;

		linLeft.localPosition.x = -timeline.position.x;
		linRight.localPosition.x = -timeline.position.x + timeline.size.x;
	
		if ( !sequence.playing ) {
			if ( timeline.CheckMouseOver () ) {
				currentTime += System.Math.Round ( Input.GetAxis ( "Mouse ScrollWheel" ) * 0.5, 1 );
				
				currentTime = Mathf.Clamp ( currentTime, 0, sequence.length );
			}
			
			sequence.SetTime ( currentTime );

			float.TryParse ( fldSequenceLength.text, sequence.length );
			fldCursorInput.text = currentTime.ToString();
		}

		cursor.localPosition.x = 10 + currentTime * timelineScale;
		timeline.position.x = -currentTime * timelineScale;
	
		UpdateTimestepLabels ();
		UpdateKeyframeButtons ();

		sequence.autoPlay = tbxAutoplay.isTicked;
		sequence.rotateAlongCurve = tbxFollowCurve.isTicked;
	}
}
