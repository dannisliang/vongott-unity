#pragma strict

public class OETransformInspector extends OEComponentInspector {
	public var position : OEVector3Field;
	public var rotation : OEVector3Field;
	public var scale : OEVector3Field;

	private function Read () {
		if ( selection.Length == 1 ) {
			var t : Transform = selection[0].transform;

			position.Read ( t.localPosition );
			rotation.Read ( t.localEulerAngles );
			scale.Read ( t.localScale );
		
		} else {
			position.Clear ();
			rotation.Clear ();
			scale.Clear ();

		}
	}

	private function Write () {
		if ( selection.Length == 1 ) {
			var t : Transform = selection[0].transform;

			t.localPosition = position.Write ();
			t.localEulerAngles = rotation.Write ();
			t.localScale = scale.Write ();
		}
	}
	
	public function Update () {
		Write ();
	}

	public function Refresh () {
		Read ();
	}
}
