var next_room:GameObject;
var prev_room:GameObject;

static var door_open = false;
var timer = 0.0;

private function Open () {
	this.animation.Play();
	door_open = true;
	next_room.SetActiveRecursively ( true );
	timer = 2.0;
}

private function Close () {
	this.animation.Play();
	door_open = false;
	prev_room.SetActiveRecursively ( false );
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
	if ( timer > 0.0 ) {
		timer = timer - Time.deltaTime;
		
		if ( timer <= 0.0 ) {
			Close();
		}
	}
	
	if ( !next_room.active && !prev_room.active ) {
		this.gameObject.SetActiveRecursively ( false );
	} else {
		this.gameObject.SetActiveRecursively ( true );
	}
}