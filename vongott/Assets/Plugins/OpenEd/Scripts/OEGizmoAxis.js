#pragma strict

public class OEGizmoAxis extends MonoBehaviour {
	private enum Axis {
		X,
		Y,
		Z
	}
	
	public var gizmo : OEGizmo;
	public var axis : Axis;

	private var lockedYPosition : float;
	private var offset : Vector3;
	private var screenPoint : Vector3;
	private var prevPosition : Vector3;

    	public function OnMouseDown () {
		screenPoint = Camera.main.WorldToScreenPoint(gameObject.transform.position);
		lockedYPosition = screenPoint.y;
   		offset = gameObject.transform.position - Camera.main.ScreenToWorldPoint ( new Vector3 ( Input.mousePosition.x, Input.mousePosition.y, screenPoint.z ) );
		prevPosition = this.transform.position;
	}
     
   	public function OnMouseDrag () {
    		var curScreenPoint : Vector3 = new Vector3 ( Input.mousePosition.x, Input.mousePosition.y, screenPoint.z );
    		var curPosition : Vector3 = Camera.main.ScreenToWorldPoint ( curScreenPoint ) + offset;
    		curPosition.x = lockedYPosition;
    	
		gizmo.transform.position += curPosition - prevPosition;

		prevPosition = curPosition;
	}
}
