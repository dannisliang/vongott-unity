// Game objects
var basement : GameObject;
var stairs_b_g : GameObject;
var groundFloor : GameObject;
var ui_root : GameObject;
var game_core : GameObject;

// Init
function Start () {
	stairs_b_g.SetActiveRecursively(false);
	groundFloor.SetActiveRecursively(false);
	Instantiate(game_core);
	Instantiate(ui_root);
}

// Game loop
function Update () {

}