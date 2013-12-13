#pragma strict

class RotateObject extends MonoBehaviour {
	var speed : float = 10.0;	
	
	function Update () {
		this.transform.localEulerAngles = new Vector3 ( 0, this.transform.localEulerAngles.y + ( speed * Time.deltaTime ), 0 );
	}
}