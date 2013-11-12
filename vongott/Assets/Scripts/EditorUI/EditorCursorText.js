#pragma strict

class EditorCursorText extends MonoBehaviour {
	var x : Transform;
	var y : Transform;
	var z : Transform;
	
	function Update () {
		var fixPoint : Vector3 = Camera.main.GetComponent(EditorCamera).cursor.position;
		var dist : float = ( Vector3.Distance ( Camera.main.transform.position, fixPoint ) * 0.04 ) + 0.1;
		
		var xPos : Vector3 = Camera.main.WorldToScreenPoint ( fixPoint + new Vector3 ( dist, 0, 0 ) );
		var yPos : Vector3 = Camera.main.WorldToScreenPoint ( fixPoint + new Vector3 ( 0, dist, 0 ) );	
		var zPos : Vector3 = Camera.main.WorldToScreenPoint ( fixPoint + new Vector3 ( 0, 0, dist ) );
		
		xPos.y = Screen.height-xPos.y;
		yPos.y = Screen.height-yPos.y;
		zPos.y = Screen.height-zPos.y;
		
		xPos.z = 10;
		yPos.z = 10;
		zPos.z = 10;
		
		x.localPosition = xPos;
		y.localPosition = yPos;
		z.localPosition = zPos;		
	}
}