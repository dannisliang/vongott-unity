#pragma strict

public class OJKeyframe {
	// Transform
	public var position : Vector3;
	public var rotation : Vector3;
	
	// Properties
	public var fov : int = 60;
	public var color : Color = Color.white;
	public var wait : float = 1;
	public var stop : boolean;
	
	// Next tween
	public var time : float = 1;
	public var easing : Ease;

	public function Focus ( cam : Transform, target : Transform ) {
		var lookPos : Vector3 = target.position - cam.position;
		lookPos.y = 0;
		
		rotation = Quaternion.LookRotation ( lookPos ).eulerAngles;
	}
}

public class OJSequence {
	public var name : String = "New Sequence";
	public var keyframes : List.< OJKeyframe > = new List.< OJKeyframe > (); 

	function OJSequence () {
		keyframes.Add ( new OJKeyframe () );
	}
}
