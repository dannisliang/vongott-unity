#pragma strict

@script AddComponentMenu ("OpenGUI/Page")

class OGPage extends MonoBehaviour {
	var pageName : String = "";

	function Start () {
		if ( pageName == "" ) {
			pageName = name;
		}
	}

	function StartPage () {}

	function UpdatePage () {}
}