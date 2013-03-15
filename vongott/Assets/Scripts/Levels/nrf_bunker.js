// Game objects
@SerializeField private var _basement:GameObject = null;
@SerializeField private var _stairs_b_g:GameObject = null;
@SerializeField private var _groundFloor:GameObject = null;

// Init
function Start () {
	_stairs_b_g.SetActiveRecursively(false);
	_groundFloor.SetActiveRecursively(false);
}

// Game loop
function Update () {

}