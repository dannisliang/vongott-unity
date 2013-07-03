#pragma strict

class Prefab extends MonoBehaviour {
	var id : String;
	var path : String;

	// Init
	function Start () {
		if ( Application.isPlaying && this.GetComponent(Rigidbody) && !GameCore.started ) {
			Destroy ( this.GetComponent(Rigidbody) );
		}
	}
	
}