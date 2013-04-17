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