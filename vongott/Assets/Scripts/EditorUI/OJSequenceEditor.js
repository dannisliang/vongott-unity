#pragma strict

public class OJSequenceEditor extends OGPage {
	private class KeyframeTransform {
		public var lblPosition : OGLabel;
		public var lblRotation : OGLabel;
	}

	private class KeyframeProperties {
		public var sldFOV : OGSlider;
		public var sldBrightness : OGSlider;
		public var fldWait : OGTextField;
		public var tbxStop : OGTickBox;
	}

	private class KeyframeTween {
		public var fldTime : OGTextField;
		public var popEasing : OGPopUp;
	}

	public var navigation : Transform;
	public var btnAdd : OGButton;
	public var keyframeTransform : KeyframeTransform;
	public var keyframeProperties : KeyframeProperties;
	public var keyframeTween : KeyframeTween;
	public var keyframeContainer : Transform;
	public var sequenceCamera : Camera;

	private var currentKeyframe : int;

	public static var sequence : OJSequence;

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
		sequence.keyframes.Add ( new OJKeyframe () );

		StartCoroutine ( GenerateKeyframeButtons () );
	}

	public function ReadKeyframe () {
		navigation.localPosition.x = 8 + currentKeyframe * 20;
		
		var kf : OJKeyframe = sequence.keyframes [ currentKeyframe ];

		keyframeTransform.lblPosition.text = kf.position.ToString();
		keyframeTransform.lblRotation.text = kf.rotation.ToString();

		keyframeProperties.sldFOV.sliderValue = kf.fov / 100;
		keyframeProperties.sldBrightness.sliderValue = kf.brightness;
		keyframeProperties.fldWait.text = kf.wait.ToString ();
		keyframeProperties.tbxStop.isTicked = kf.stop;
	}

	public function WriteKeyframe () {
		var kf : OJKeyframe = sequence.keyframes [ currentKeyframe ];
	
		kf.position = sequence.cam.transform.localPosition;
		keyframeTransform.lblPosition.text = kf.position.ToString();
		
		kf.rotation = sequence.transform.localEulerAngles;
		keyframeTransform.lblRotation.text = kf.rotation.ToString();
		
		kf.fov = 100 * keyframeProperties.sldFOV.sliderValue;
		kf.brightness = keyframeProperties.sldBrightness.sliderValue;
		kf.wait = float.Parse ( keyframeProperties.fldWait.text );
		kf.stop = keyframeProperties.tbxStop.isTicked;
	}

	private function GenerateKeyframeButtons () : IEnumerator {
		for ( var i : int = 0; i < keyframeContainer.childCount; i++ ) {
			Destroy ( keyframeContainer.GetChild ( i ).gameObject );
		}

		yield WaitForEndOfFrame ();
		
		for ( i = 0; i < sequence.keyframes.Count; i++ ) {
			var btn : OGButton = new GameObject ( i.ToString () ).AddComponent.< OGButton > ();
			btn.ApplyDefaultStyles ();
			btn.text = i.ToString ();
			btn.target = this.gameObject;
			btn.message = "SelectKeyframe";
			btn.argument = i.ToString ();

			btn.transform.parent = keyframeContainer;
			btn.transform.localScale = new Vector3 ( 16, 16, 1 );
			btn.transform.localPosition = new Vector3 ( i * 20, -8, 0 );
		}

		btnAdd.transform.localPosition.x = 20 * ( i + 1 );
	}

	override function StartPage () {
		sequenceCamera.enabled = true;

		StartCoroutine ( GenerateKeyframeButtons () );
	}

	override function ExitPage () {
		sequenceCamera.enabled = false;
		
		sequence = null;
	}
}
