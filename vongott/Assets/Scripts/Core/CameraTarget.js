#pragma strict

////////////////////
// Prerequisites
////////////////////
// Public vars
var cam : GameObject;
var player : GameObject;

// Private vars
private var runcam = false;
private var cam_init = false;

// Static vars
static var instance : Transform;
static var cam_in_front = false;


////////////////////
// Private functions
////////////////////
// Check visibility
private function CheckVisibility ( pos : Vector3 ) : Vector3 {
	var origin : Vector3 = cam.transform.position;
	var target : Vector3 = player.transform.position;
	var direction = cam.transform.forward;
	var distance = Vector3.Distance ( origin, target );
		
	direction.Normalize();

	var hits : RaycastHit[] = Physics.RaycastAll ( origin, direction, distance );

	//Debug.DrawRay ( origin, direction, Color.green, 1 );
	
	for ( var i = 0; i < hits.Length; i++ ) {
		if ( hits[i].collider.gameObject != player ) {
			pos.z += 0.1;
			continue;
		}
	}

	if ( hits.Length <= 0 && pos.z > -4.5 ) {
		pos.z -= 0.1;
	}
			
	return pos;
}

// Camera distance
function GetCamDist() : Vector3 {
	var x : float = 0.5; 
	var y : float = 0.0; 
	var z : float = 2.0; 
	
	var speed : float = player.GetComponent(Animator).GetFloat("Speed");
	
	if ( speed > 0.25 ){
		z += 4.0 * ( speed - 0.25 );
		x -= 0.5 * ( speed - 0.25 );
	}
	
	return new Vector3 ( x, y, z );
}

////////////////////
// Public functions
////////////////////
// Init
function Start () {
	instance = this.gameObject.transform;
}

// Update
function Update () {
	if ( !cam_init ) {
		if ( cam != null ) {
			cam.transform.parent = this.transform;
			cam.transform.localPosition = new Vector3 ( 0.5, 0.5, -2.0 );
			cam.transform.localEulerAngles = Vector3.zero;
			cam_init = true;
		} else {
			return;
		}
	}
	
	this.transform.position = player.transform.position + Vector3 ( 0, 1, 0 );
	cam.transform.localPosition = new Vector3 ( GetCamDist().x, 0.5, -GetCamDist().z );
	
	// input
	if ( Input.GetKeyDown(KeyCode.LeftShift) && !runcam ) {
		runcam = true;
	} else if ( Input.GetKeyUp(KeyCode.LeftShift) && runcam ) {
		runcam = false;
	}
}


////////////////////
// Static functions
////////////////////
// Turn camera in front or back of player
static function TurnCam ( in_front : boolean ) {
	cam_in_front = in_front;
	
	instance.gameObject.GetComponent(MouseLook).SetActive ( !in_front );
}