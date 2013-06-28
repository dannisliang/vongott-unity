#pragma strict

@script ExecuteInEditMode

class Prefab extends MonoBehaviour {
	var id : String;
	var path : String;

	function Start () {
		if ( this.GetComponent(Rigidbody) && !GameCore.started ) {
			Destroy ( this.GetComponent(Rigidbody) );
		}
	}
}