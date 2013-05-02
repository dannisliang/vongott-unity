#pragma strict

class EditorInspectorTween extends MonoBehaviour {
	var easing;
	var speed : int;
	var adjusting : int = 0;
	
	function AdjustFrom () {
		adjusting = 0;
	}
	
	function AdjustTo () {
		adjusting = 1;
	}
	
	function Init ( obj : GameObject ) {
	
	}
	
	function Update () {
		for ( var o : GameObject in EditorCore.GetSelectedObjects() ) {
			if ( o.GetComponent ( Tween ) ) {
				var t : Tween = o.GetComponent ( Tween );
				
				if ( adjusting == 0 ) {
					t.fromPos = o.transform.localPosition;
					t.fromRot = o.transform.localEulerAngles;
					t.fromScl = o.transform.localScale;
				} else {
					t.toPos = o.transform.localPosition;
					t.toRot = o.transform.localEulerAngles;
					t.toScl = o.transform.localScale;
				}
			}
		}
	}
}