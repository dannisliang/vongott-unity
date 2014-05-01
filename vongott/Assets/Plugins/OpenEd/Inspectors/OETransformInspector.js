#pragma strict

public class OETransformInspector extends OEComponentInspector {
	public var position : OEVector3Field;
	public var rotation : OEVector3Field;
	public var scale : OEVector3Field;

	override function Update () {
		if ( target ) {
			var t : Transform = target.transform;

			if ( position.listening ) {
				t.localPosition = position.Out ();
			} else {
				position.In ( t.localPosition );
			}

			if ( rotation.listening ) {
				t.localEulerAngles = rotation.Out ();
			} else {
				rotation.In ( t.localEulerAngles );
			}

			if ( scale.listening ) {
				t.localScale = scale.Out ();
			} else {
				scale.In ( t.localScale );
			}
		}
	}

	public function ResetPosition () {
		if ( target ) {
			var t : Transform = target.transform;
			t.localPosition = position.Out ();
		}
	}
	
	public function ResetRotation () {
		if ( target ) {
			var t : Transform = target.transform;
			t.localEulerAngles = rotation.Out ();
		}
	}
	
	public function ResetScale () {
		if ( target ) {
			var t : Transform = target.transform;
			t.localScale = scale.Out ();
		}
	}
}
