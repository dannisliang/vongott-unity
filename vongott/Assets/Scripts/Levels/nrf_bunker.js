// Game objects
var basement : GameObject;
var stairs_b_g : GameObject;
var groundFloor : GameObject;

// Init
function Start () {
	GameCore.Start();

	stairs_b_g.SetActiveRecursively(false);
	groundFloor.SetActiveRecursively(false);
	
	PageManager.GoToPage("HUD");
}

// Game loop
function Update () {
	GameCore.Update();
}