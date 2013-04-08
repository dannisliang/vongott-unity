// Game objects
var player:GameObject;
var cam:GameObject;

// Init
function Start () {
	
}

// Game loop
function Update () {
	this.transform.localPosition = player.transform.localPosition;
	cam.transform.localEulerAngles = Vector3.zero;
	cam.transform.localPosition = new Vector3 ( 0, 0, -30 );
}