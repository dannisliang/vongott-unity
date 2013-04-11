////////////////////
// Prerequisites
////////////////////
// Inspector items
var player:GameObject;
var cam:GameObject;

// Private vars
private var rotation_destination = 0.0;
private var turning = false;

////////////////////
// Private functions
////////////////////
private function TurnLeft () {
	rotation_destination = -90;
}

private function TurnRight () {
	rotation_destination = 90;
}

private function CheckTurn () {
	var y = 0.0;
	
	if ( rotation_destination > 0.0 ) {
		y = this.gameObject.transform.localEulerAngles.y;
		this.gameObject.transform.localEulerAngles = new Vector3 ( 16.0, y - 1.0, 0.0 );
		rotation_destination--;
		turning = true;
	} else if ( rotation_destination < 0.0 ) {
		y = this.gameObject.transform.localEulerAngles.y;
		this.gameObject.transform.localEulerAngles = new Vector3 ( 16.0, y + 1.0, 0.0 );
		rotation_destination++;
		turning = true;
	} else {
		turning = false;
	}
}

////////////////////
// Public functions
////////////////////
// Init
function Start () {
	
}

// Update
function Update () {
	this.transform.localPosition = player.transform.localPosition;
	cam.transform.localEulerAngles = Vector3.zero;
	cam.transform.localPosition = new Vector3 ( 0, 0, -30 );

	// turning
	CheckTurn();
	
	// input
	if ( Input.GetKeyDown(KeyCode.Q) && !turning ) {
		TurnLeft ();
	} else if ( Input.GetKeyDown(KeyCode.E) && !turning ) {
		TurnRight ();
	}
}