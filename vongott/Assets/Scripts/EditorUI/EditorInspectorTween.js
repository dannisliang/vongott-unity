#pragma strict

class EditorInspectorTween extends MonoBehaviour {
	var easing;
	var speed : int;
	var adjusting : int = 0;
	
	function Init ( obj : GameObject ) {
	
	}
	
	function Update () {
		var o : GameObject = EditorCore.GetSelectedObject();
		
		if ( o.GetComponent ( Tween ) ) {
			var t : Tween = o.GetComponent ( Tween );
		}
	}
}