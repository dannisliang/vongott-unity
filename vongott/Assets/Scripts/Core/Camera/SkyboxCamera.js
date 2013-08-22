#pragma strict

class SkyboxCamera extends MonoBehaviour {
	
	var precision : float = 1.0;
	
	function Update () {
		transform.rotation = Camera.main.transform.rotation;
	}
	
}