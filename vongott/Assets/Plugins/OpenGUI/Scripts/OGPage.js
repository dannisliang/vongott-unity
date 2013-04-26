#pragma strict

@script ExecuteInEditMode

class OGPage extends MonoBehaviour {
	var pageName : String = "";

	function Start () {
		if ( pageName == "" ) {
			pageName = name;
		}
	}
}