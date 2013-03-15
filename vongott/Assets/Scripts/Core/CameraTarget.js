// Game objects
@SerializeField private var _player:GameObject = null;

// Init
function Start () {

}

// Game loop
function Update () {
	this.transform.position = _player.transform.position;
}