#pragma strict

public class OETransformInspector extends OEComponentInspector {
	public var position : OEVector3Field;
	public var rotation : OEVector3Field;
	public var scale : OEVector3Field;

	override function Update () {
		if ( target ) {
			var t : Transform = target.transform;

			t.localPosition = position.Set ( t.localPosition );
			t.localEulerAngles = rotation.Set ( t.localEulerAngles );
			t.localScale = scale.Set ( t.localScale );
		}
	}

	public function ResetPosition () {
		if ( target ) {
			var t : Transform = target.transform;
			t.localPosition = Vector3.zero;
		}
	}
	
	public function ResetRotation () {
		if ( target ) {
			var t : Transform = target.transform;
			t.localEulerAngles = Vector3.zero;
		}
	}
	
	public function ResetScale () {
		if ( target ) {
			var t : Transform = target.transform;
			t.localScale = Vector3.one;
		}
	}
}
