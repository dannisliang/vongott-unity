#pragma strict

class MainMenuBase extends OGPage {
	public var background : Transform;
	
	override function StartPage () {
		background.localScale = new Vector3 ( 2.5, 0.7, 1 );
	}

	public function GoToPage ( pageName : String ) {
		OGRoot.GetInstance().GoToPage ( pageName );
	}
	
	public function GoToEditor () {
		Application.LoadLevel ( "editor" );
	}

	public function ExitGame () {
		Application.Quit ();	
	}
}
