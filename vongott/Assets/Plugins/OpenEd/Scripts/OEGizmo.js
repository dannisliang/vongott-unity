#pragma strict

public class OEGizmo extends MonoBehaviour {
	public var mode : OETransformMode;
	public var x : OEGizmoAxis;
	public var y : OEGizmoAxis;
	public var z : OEGizmoAxis;

	public var following : boolean = true;

	private var prevPos : Vector3;

	private function GetAveragePosition () : Vector3 {
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
		this.transform.position = GetAveragePosition ();
	}

	public function Move ( delta : Vector3 ) {
		this.transform.Translate ( delta );
		
		for ( var i : int = 0; i < OEWorkspace.GetInstance().selection.Count; i++ ) {
			var t : Transform = OEWorkspace.GetInstance().selection[i].transform;
			t.position += delta;
		}
	}
	
	public function Rotate ( axis : OEGizmoAxis.Axis ) {
		var dx : float = -Input.GetAxis ( "Mouse X" ) * 2;
		var dy : float = Input.GetAxis ( "Mouse Y" ) * 2;
		var delta : Vector3;

		switch ( axis ) {
			case OEGizmoAxis.Axis.X:
				delta.x = dy;
				break;
			
			case OEGizmoAxis.Axis.Y:
				delta.y = dx;
				break;
			
			case OEGizmoAxis.Axis.Z:
				delta.z = dy;
				break;
		}
		
		for ( var i : int = 0; i < OEWorkspace.GetInstance().selection.Count; i++ ) {
			var t : Transform = OEWorkspace.GetInstance().selection[i].transform;
			t.localRotation = Quaternion.Euler ( t.localEulerAngles + delta );
		}
	}
	
	public function Scale ( delta : Vector3 ) {
		delta.z = -delta.z;
		
		this.transform.localScale += delta;
		
		for ( var i : int = 0; i < OEWorkspace.GetInstance().selection.Count; i++ ) {
			var t : Transform = OEWorkspace.GetInstance().selection[i].transform;
			t.localScale += delta;
		}
	}

	public function Update () {
		this.transform.localScale = new Vector3 ( 0.1, 0.1, 0.1 ) * Vector3.Distance ( Camera.main.transform.position, this.transform.position );
		
		if ( following ) {
			this.transform.position = GetAveragePosition ();
		}
	}
}
