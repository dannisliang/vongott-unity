// Game objects
@SerializeField private var _player:GameObject = null;

// Init
function Start () {
	this.gameObject.transform.FindChild("MainCamera").localPosition = new Vector3 ( 4.5f, -12.5f, -25f );
}

// Game loop
function Update () {
	this.transform.position = _player.transform.position;
}