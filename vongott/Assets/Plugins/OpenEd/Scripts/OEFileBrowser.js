#pragma strict

public class OEFileBrowser extends OGPage {
	public var path : String = "";

	public function OK () {

	}

	public function Cancel () {
		OGRoot.GetInstance().GoToPage ( "Home" );
	}

	override function StartPage () {

	}
}
