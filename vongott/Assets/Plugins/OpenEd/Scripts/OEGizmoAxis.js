#pragma strict

public class OEGizmoAxis extends MonoBehaviour {
	public enum Axis {
		X,
		Y,
		Z
	}
	
	public var gizmo : OEGizmo;
	public var axis : Axis;

	private var lockedPosition : Vector3;
	private var offset : Vector3;
	private var screenPoint : Vector3;
	private var prevPosition : Vector3;

    	public function OnMouseDown () {
		gizmo.following = false;
		
		screenPoint = Camera.main.WorldToScreenPoint(gameObject.transform.position);
		lockedPosition = gameObject.transform.position;
   		offset = gameObject.transform.position - Camera.main.ScreenToWorldPoint ( new Vector3 ( Input.mousePosition.x, Input.mousePosition.y, screenPoint.z ) );
		prevPosition = this.transform.position;
	}
     
   	public function OnMouseDrag () {
    		var curScreenPoint : Vector3 = new Vector3 ( Input.mousePosition.x, Input.mousePosition.y, screenPoint.z );
    		var curPosition : Vector3 = Camera.main.ScreenToWorldPoint ( curScreenPoint ) + offset;
    	
		switch ( axis ) {
			case Axis.X:
				curPosition.y = lockedPosition.y;
				curPosition.z = lockedPosition.z;
				break;
			
			case Axis.Y:
				curPosition.x = lockedPosition.x;
				curPosition.z = lockedPosition.z;
				break;
			
			case Axis.Z:
				curPosition.x = lockedPosition.x;
				curPosition.y = lockedPosition.y;
				break;
		}
		
		switch ( gizmo.mode ) {
			case OETransformMode.Position:
				gizmo.Move ( curPosition - prevPosition );
				break;
			
			case OETransformMode.Rotation:
				gizmo.Rotate ( axis );
				break;
			
			case OETransformMode.Scale:
				gizmo.Scale ( curPosition - prevPosition );
				break;
		}

		prevPosition = curPosition;
	}

	public function OnMouseUp () {
		gizmo.following = true;
	}
}
