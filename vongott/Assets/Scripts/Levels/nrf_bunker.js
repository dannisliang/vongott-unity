// Game objects
var basement : GameObject;
var stairs_b_g : GameObject;
var groundFloor : GameObject;

// Init
function Start () {
	if ( !GameCore.started ) {
		GameCore.Start();
	}
}

// Game loop
function Update () {
	GameCore.Update();
}