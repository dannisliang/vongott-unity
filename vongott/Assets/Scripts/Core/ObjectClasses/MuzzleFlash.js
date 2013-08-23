#pragma strict

class MuzzleFlash extends MonoBehaviour {
	var timer : float = 0.0;
	var maxTime : float = 0.4;

	function Update () {
		if ( timer < maxTime ) {
			timer += Time.deltaTime;
		} else {
			this.gameObject.SetActive ( false );
		}
	}
	
	function OnDisabled () {
		timer = 0.0;
	}
}