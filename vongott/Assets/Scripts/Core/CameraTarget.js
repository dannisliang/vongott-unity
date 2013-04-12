////////////////////
// Prerequisites
////////////////////
// Inspector items
var player:GameObject;
var cam:GameObject;
var cam_tween:TweenPosition;

// Private vars
private var runcam = false;

////////////////////
// Private functions
////////////////////


////////////////////
// Public functions
////////////////////
// Init
function Start () {
	cam.transform.localPosition = new Vector3( 0.4, 0.6, -3.0 );
	cam.transform.localEulerAngles = Vector3.zero;
}

// Update
function Update () {
	this.transform.localPosition = player.transform.localPosition;
	this.transform.localEulerAngles = player.transform.localEulerAngles;

	
	// input
	if ( Input.GetKeyDown(KeyCode.LeftShift) && !runcam ) {
		cam_tween.Play(true);
		runcam = true;
	} else if ( Input.GetKeyUp(KeyCode.LeftShift) && runcam ) {
		cam_tween.Play(false);
		runcam = false;
	}
}