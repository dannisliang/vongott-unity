// Game objects
var basement : GameObject;
var stairs_b_g : GameObject;
var groundFloor : GameObject;

// Init
function Start () {
	GameCore.Start();

	stairs_b_g.SetActive(false);
	groundFloor.SetActive(false);
}

// Game loop
function Update () {
	GameCore.Update();
}