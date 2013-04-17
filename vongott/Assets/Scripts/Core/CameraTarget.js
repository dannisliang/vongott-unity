#pragma strict

////////////////////
// Prerequisites
////////////////////
// Inspector items
var player:GameObject;
var cam:GameObject;

// Private vars
private var runcam = false;

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

// Hide obscuring objects
private function HideObscuringObjects () {
	var origin : Vector3 = cam.transform.position;
	var target : Vector3 = player.transform.position;
	var direction = cam.transform.forward;
	var distance = Vector3.Distance ( origin, target );
		
	direction.Normalize();

	var hits : RaycastHit[] = Physics.RaycastAll ( origin, direction, distance );
	
	for ( var i = 0; i < hits.Length; i++ ) {
		if ( hits[i].collider.gameObject != player ) {
			hits[i].collider.gameObject.renderer.enabled = false;
		}
	}
}

// Check run cam
private function CheckRunCam ( pos : Vector3 ) : Vector3 {
	if ( runcam ) {
		if ( pos.x > 0.0 ) 		{ pos.x -= 0.01; }
		if ( pos.z > -10.0 ) 	{ pos.z -= 0.1; }
	} else {
		if ( pos.x < 0.5 ) 		{ pos.x += 0.01; }
		if ( pos.z < -4.5 ) 	{ pos.z += 0.1; }
	}
	
	return pos;
}

// Check position
private function CheckPosition () {	
	var pos : Vector3 = cam.transform.localPosition;
	
	pos = CheckRunCam ( pos );
	//HideObscuringObjects();
	//pos = CheckVisibility ( pos );
	
	cam.transform.localPosition = pos;
}

////////////////////
// Public functions
////////////////////
// Init
function Start () {
	cam.transform.localPosition = new Vector3 ( 0.5, 0.5, -4.5 );
	cam.transform.localEulerAngles = Vector3.zero;
	
	instance = this.gameObject.transform;
}

// Update
function Update () {
	this.transform.localPosition = player.transform.localPosition;
	
	// check for menu cam
	if ( !cam_in_front ) {
		CheckPosition ();
	}
	
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