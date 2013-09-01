#pragma strict

class PathNode extends MonoBehaviour {
	var duration : int;
	var owner : GameObject;
	
	function Update () {
		if ( GameCore.started && this.GetComponent(MeshRenderer).enabled ) {
			this.GetComponent(MeshRenderer).enabled = false;
		}
	}
}