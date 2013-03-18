@SerializeField private var next_room:GameObject;

static var door_open = false;

private function Open () {
	this.animation.Play();
	door_open = true;
	next_room.SetActiveRecursively ( true );
}

private function Close () {
	this.animation.Play();
	door_open = false;
	//_room.SetActiveRecursively ( true );
}

function Toggle () {
	if ( door_open ) {
		Close ();
	} else {
		Open ();
	}
}

function Start () {
}

function Update () {
	
}