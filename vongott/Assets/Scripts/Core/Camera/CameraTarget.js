#pragma strict

////////////////////
// Prerequisites
////////////////////
// Public vars
var cam : GameObject;
var player : GameObject;

// Private vars
private var cam_init = false;
private var skyboxCamera : GameObject;

// Static vars
static var instance : Transform;


////////////////////
// Camera functions
////////////////////
// Is player crouching?
function IsCrouching () : boolean {
	return player.GetComponent(PlayerController).state == PlayerController.PlayerState.Crouching;
}

// Compensate for walls
function CompensateForWalls ( newPos : Vector3 ) {
	var to : Vector3 = cam.transform.TransformPoint(newPos);
	var from : Vector3 = this.transform.position;
	var forward = Camera.main.transform.TransformDirection ( Vector3.forward );
	
	var wallHit : RaycastHit = new RaycastHit();		

	if ( Physics.Linecast ( from, to, wallHit, 9 ) ) {
		Debug.DrawLine( from, wallHit.point, Color.blue);
		newPos = Camera.main.transform.InverseTransformPoint( wallHit.point );
	} else {
		Debug.DrawLine ( from, to, Color.cyan );
	}
	
	return newPos;
}

// Camera distance
function GetCamDist() : Vector3 {
	var x : float = 0.5; 
	var y : float = 0.0; 
	var z : float = -3.0; 
	
	var speed : float = player.GetComponent(PlayerController).speed;
	var newPos : Vector3;
	
	if ( speed > 1.0 ) { speed = 1.0; }
	
	if ( Input.GetMouseButton(1) ) {
		z += 2.0;
		x -= 0.1;
	} else if ( speed > 0.25 ){
		z -= 3.0 * ( speed - 0.25 );
		x -= 0.5 * ( speed - 0.25 );
	
	}
			
	newPos = new Vector3 ( x, y, z );
	newPos = CompensateForWalls ( newPos );
	
	return newPos;
}


// Init
function Start () {
	instance = this.gameObject.transform;
	skyboxCamera = GameObject.FindWithTag ( "SkyboxCamera" );
	player = GameCore.GetPlayerObject();
}

// Update
function Update () {
	if ( !cam_init ) {
		if ( cam != null ) {
			cam.transform.parent = this.transform;
			cam.transform.localPosition = new Vector3 ( 0.5, 0.0, -2.0 );
			cam.transform.localEulerAngles = Vector3.zero;
			cam_init = true;
		} else {
			return;
		}
	}
	
	var adjustment : Vector3;
	var standCam = new Vector3 ( 0, 1.35, 0 );
	var crouchCam = new Vector3 ( 0, 0.8, 0 );
	var convoCam = new Vector3 ( 0, 1.65, 0 );
	var aimCam = new Vector3 ( 0, 1.65, 0 );
	
	if ( IsCrouching() ) {
		adjustment = crouchCam;
	} else if ( OGRoot.currentPage && OGRoot.currentPage.pageName == "Conversation" ) {
		adjustment = convoCam;
	} else if ( Input.GetMouseButton(1) ) {
		adjustment = aimCam;
	} else {
		adjustment = standCam;
	}
	
	this.transform.position = Vector3.Slerp ( this.transform.position, player.transform.position + adjustment, Time.deltaTime * 10 );
	cam.transform.localPosition = Vector3.Slerp ( cam.transform.localPosition, GetCamDist(), Time.deltaTime * 5 );
	
	if ( skyboxCamera ) {
		skyboxCamera.transform.rotation = cam.transform.rotation;
		skyboxCamera.transform.localPosition = transform.position / 10;
	}
}