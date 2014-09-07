#pragma strict

public class OJSequenceEditor extends OGPage {
	public var linLeft : Transform;
	public var linRight : Transform;
	public var timestepContainer : Transform;
	public var keyframeContainer : Transform;
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

		StartCoroutine ( GenerateKeyframeButtons () );
	}

	public function AddKeyframe () {
		sequence.AddKeyframe ( currentTime );

		StartCoroutine ( GenerateKeyframeButtons () );
	}

	public function ReadKeyframe () {
	}
	
	private function GenerateTimestepLabels () : IEnumerator {
		for ( var i : int = 0; i < timestepContainer.childCount; i++ ) {
			Destroy ( timestepContainer.GetChild ( i ).gameObject );
		}

		yield WaitForEndOfFrame ();
		
		for ( i = 0; i <= sequence.length; i++ ) {
			var lbl : OGLabel = new GameObject ( i.ToString () ).AddComponent.< OGLabel > ();
			lbl.ApplyDefaultStyles ();
			lbl.text = i.ToString ();
			lbl.pivot.x = RelativeX.Center;
			lbl.overrideAlignment = true;
			lbl.alignment = TextAnchor.UpperCenter;

			lbl.transform.parent = timestepContainer;
			lbl.transform.localScale = new Vector3 ( 20, 14, 1 );
			lbl.transform.localPosition = new Vector3 ( i * timelineScale, 0, 0 );
		}
	}

	private function GenerateKeyframeButtons () : IEnumerator {
		for ( var i : int = 0; i < keyframeContainer.childCount; i++ ) {
			Destroy ( keyframeContainer.GetChild ( i ).gameObject );
		}

		yield WaitForEndOfFrame ();
		
		for ( i = 0; i < sequence.keyframes.Count; i++ ) {
			var kf : OJKeyframe = sequence.keyframes [ i ];

			var btn : OGButton = new GameObject ( i.ToString () ).AddComponent.< OGButton > ();
			btn.ApplyDefaultStyles ();
			btn.target = this.gameObject;
			btn.message = "SelectKeyframe";
			btn.argument = i.ToString ();

			btn.transform.parent = keyframeContainer;
			btn.transform.localScale = new Vector3 ( 10, 20, 1 );
			btn.transform.localPosition = new Vector3 ( kf.time * timelineScale - 5, 0, 0 );
		}
	}

	public function Refresh () {
		StartCoroutine ( GenerateKeyframeButtons () );
		StartCoroutine ( GenerateTimestepLabels () );
	}

	override function StartPage () {
		sequenceCamera.enabled = true;
		
		Refresh ();
	}

	override function ExitPage () {
		sequenceCamera.enabled = false;
	}

	public function Update () {
		var prevTimelineScale : float = timelineScale;
	       	timelineScale = 20 + sldScale.sliderValue * 100;

		if ( timelineScale != prevTimelineScale ) {
			Refresh ();
		}

		linLeft.localPosition.x = -timeline.position.x;
		linRight.localPosition.x = -timeline.position.x + timeline.size.x;
	
		if ( Input.GetMouseButton ( 0 ) && timeline.CheckMouseOver () ) {
			currentTime -= Input.GetAxis ( "Mouse X" );
			
			currentTime = Mathf.Clamp ( currentTime, 0, sequence.length );
		}
		
		cursor.localPosition.x = 10 + currentTime * timelineScale;
		timeline.position.x = -currentTime * timelineScale;
	}
}
