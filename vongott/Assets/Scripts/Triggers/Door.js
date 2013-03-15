@SerializeField private var _nextRoom:GameObject = null;

private var _doorOpen:boolean = false;

function Open () {
	if ( !_doorOpen ) {
		this.animation.Play();
		_doorOpen = true;
	}
}

function Close () {
	
}

function OnTriggerEnter ( other:Collider ) {
	Open();
	_nextRoom.SetActiveRecursively ( true );
}

function Start () {
}

function Update () {
	
}