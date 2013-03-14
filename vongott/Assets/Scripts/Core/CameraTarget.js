// Game objects
@SerializeField private var _player:GameObject = null;

// Init
function Start () {

}

// Game loop
function Update () {
	this.transform.localPosition = _player.transform.localPosition;
}