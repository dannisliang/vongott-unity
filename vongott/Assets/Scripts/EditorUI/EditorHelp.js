#pragma strict

class EditorHelp extends OGPage {
	function Close () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
}