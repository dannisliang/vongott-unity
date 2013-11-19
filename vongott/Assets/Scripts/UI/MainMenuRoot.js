#pragma strict

class MainMenuRoot extends OGRoot {
	var logo : Transform;
	var logoSpeed : float = 10.0;	
	
	function Update () {
		logo.localEulerAngles = new Vector3 ( logo.localEulerAngles.x, logo.localEulerAngles.y + ( logoSpeed * Time.deltaTime ), logo.localEulerAngles.z );
	}
}
