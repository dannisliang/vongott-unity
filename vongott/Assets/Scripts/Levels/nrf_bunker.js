// Game objects
var basement : GameObject;
var stairs_b_g : GameObject;
var groundFloor : GameObject;

// Init
function Start () {
	Instantiate ( Resources.Load ( "Prefabs/Core/game_core" ) );

	stairs_b_g.SetActiveRecursively(false);
	groundFloor.SetActiveRecursively(false);
}

// Game loop
function Update () {

}