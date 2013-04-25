#pragma strict

@script ExecuteInEditMode

class Prefab extends MonoBehaviour {
	var id : String;
	var path : String;
	
	function Start () {
		if ( !id ) {
			id = this.gameObject.name;
		}
	}
}