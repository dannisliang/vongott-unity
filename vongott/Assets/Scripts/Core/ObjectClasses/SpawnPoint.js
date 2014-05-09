#pragma strict

class SpawnPoint extends MonoBehaviour {
	function Start () {
		if ( GameCore.running ) {
			this.GetComponent(MeshRenderer).enabled = false;
			this.GetComponent(BoxCollider).enabled = false;
		}
	}
}
