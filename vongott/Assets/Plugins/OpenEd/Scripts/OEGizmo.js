#pragma strict

public class OEGizmo extends MonoBehaviour {
	public var mode : OETransformMode;
	public var x : OEGizmoAxis;
	public var y : OEGizmoAxis;
	public var z : OEGizmoAxis;

	private var prevPos : Vector3;

	private function GetCenter () : Vector3 {
		var result : Vector3 = Vector3.zero;
		
		if ( OEWorkspace.GetInstance().selection.Count > 0 ) {
			for ( var i : int = 0; i < OEWorkspace.GetInstance().selection.Count; i++ ) {
				result += OEWorkspace.GetInstance().selection[i].transform.position;
			}

			result /= OEWorkspace.GetInstance().selection.Count;
		}

		return result;
	}

	public function PutInCenter () {
		this.transform.position = GetCenter ();
	}

	public function Move ( delta : Vector3 ) {
		this.transform.Translate ( delta );
		
		for ( var i : int = 0; i < OEWorkspace.GetInstance().selection.Count; i++ ) {
			OEWorkspace.GetInstance().selection[i].transform.Translate ( delta );
		}
	}
}
