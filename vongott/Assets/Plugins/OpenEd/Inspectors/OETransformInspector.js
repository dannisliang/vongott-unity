#pragma strict

public class OETransformInspector extends OEComponentInspector {
	public var position : OEVector3Field;
	public var rotation : OEVector3Field;
	public var scale : OEVector3Field;

	override function In () {
		var t : Transform = target.transform;

		position.In ( t.localPosition );
		rotation.In ( t.localEulerAngles );
		scale.In ( t.localScale );
	}

	override function Out () {
		var t : Transform = target.transform;

		t.localPosition = position.Out ();
		t.localEulerAngles = rotation.Out ();
		t.localScale = scale.Out ();
	}
}
