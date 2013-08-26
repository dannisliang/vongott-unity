#pragma strict

var normalCollisionCount = 1;
var moveLimit = .5;
var collisionMoveFactor = .01;
var addHeightWhenClicked = 0.0;
var freezeRotationOnDrag = true;
var cam : Camera;
var dragModifiers : Vector3 = Vector3.one;
private var myTransform : Transform;
private var canMove = false;
private var yPos : float;
private var gravitySetting : boolean;
private var freezeRotationSetting : boolean;
private var sqrMoveLimit : float;
private var collisionCount = 0;
private var camTransform : Transform;
 
function Start () {
	myTransform = transform;
	if (!cam) {
		cam = Camera.main;
	}
	if (!cam) {
		Debug.LogError("Can't find camera tagged MainCamera");
		return;
	}
	camTransform = cam.transform;
	sqrMoveLimit = moveLimit * moveLimit;	// Since we're using sqrMagnitude, which is faster than magnitude
}
 
function OnMouseDown () {
	canMove = true;
	myTransform.Translate(Vector3.up*addHeightWhenClicked);
	yPos = myTransform.position.y;
}
 
function OnMouseUp () {
	canMove = false;
}
 
function OnCollisionEnter () {
	collisionCount++;
}
 
function OnCollisionExit () {
	collisionCount--;
}
 
function FixedUpdate () {
	if (!canMove) return;
 
	myTransform.position.y = yPos;
	var mousePos = Input.mousePosition;
	var move = cam.ScreenToWorldPoint(Vector3(mousePos.x, mousePos.y, camTransform.position.y - myTransform.position.y)) - myTransform.position;
	
	move.x = move.x * dragModifiers.x;
	move.y = move.y * dragModifiers.y;
	move.z = move.z * dragModifiers.z;
	
	if (collisionCount > normalCollisionCount) {
		move = move.normalized*collisionMoveFactor;
	}
	else if (move.sqrMagnitude > sqrMoveLimit) {
		move = move.normalized*moveLimit;
	}
 
    this.transform.position = this.transform.position + move;
}