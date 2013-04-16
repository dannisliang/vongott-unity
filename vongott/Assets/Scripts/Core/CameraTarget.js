#pragma strict

////////////////////
// Prerequisites
////////////////////
// Inspector items
var player:GameObject;
var cam:GameObject;
var camTween:TweenTransform;
var followSpeed = 18.0;

// Private vars
private var runcam = false;

// Static vars
static var instance : Transform;
static var cam_in_front = false;


////////////////////
// Private functions
////////////////////
// Ease follow
private function EaseFollow () {
	if ( cam_in_front ) {
		this.transform.localPosition = player.transform.localPosition;
		this.transform.localEulerAngles = new Vector3 ( this.transform.localEulerAngles.x, player.transform.localEulerAngles.y + 180.0, this.transform.localEulerAngles.z );
	} else {
		var now_y = this.transform.localEulerAngles.y;
		var end_y = player.transform.localEulerAngles.y;
		var new_y = now_y + ( end_y - now_y ) / followSpeed;
		
		this.transform.localPosition = player.transform.localPosition;
		this.transform.localEulerAngles = new Vector3 ( this.transform.localEulerAngles.x, new_y, this.transform.localEulerAngles.z );
	}
}


////////////////////
// Public functions
////////////////////
// Init
function Start () {
	cam.transform.localPosition = Vector3.zero;
	cam.transform.localEulerAngles = Vector3.zero;
	
	camTween.Play(false);
	
	instance = this.gameObject.transform;
}

// Update
function Update () {
	EaseFollow();
	
	// input
	if ( Input.GetKeyDown(KeyCode.LeftShift) && !runcam ) {
		camTween.Play(true);
		runcam = true;
	} else if ( Input.GetKeyUp(KeyCode.LeftShift) && runcam ) {
		camTween.Play(false);
		runcam = false;
	}
}


////////////////////
// Static functions
////////////////////
// Turn camera in front or back of player
static function TurnCam ( in_front : boolean ) {
	cam_in_front = in_front;
}