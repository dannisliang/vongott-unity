#pragma strict

class RotateObject extends MonoBehaviour {
	var speed : float = 50;
	
	function Update () {
		var newRot : Vector3 = transform.localEulerAngles;
		
		newRot.y += speed * Time.deltaTime;
		
		transform.localEulerAngles = newRot;
	}
}