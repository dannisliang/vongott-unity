#pragma strict

class MainMenuBase extends OGPage {
	public var background : Transform;
	
	override function StartPage () {
		var v : Vector3 = background.localScale;
		v.y = 0.0001;
		background.localScale = v;
		
		HideContent ();

		iTween.ScaleTo ( background.gameObject, iTween.Hash (
			"y", 0.7,
			"time", 0.25,
			"oncompletetarget", this.gameObject,
			"oncomplete", "ShowContent"
		) );
	}

	public function GoToLoadGame () {
		OGRoot.GetInstance().GoToPage ( "LoadGame" );
	}

	public function HideContent () {
		this.transform.GetChild(0).gameObject.SetActive ( false );
	}
	
	public function ShowContent () {
		this.transform.GetChild(0).gameObject.SetActive ( true );
	}

	public function GoToPage ( pageName : String ) {
		HideContent ();
		
		iTween.ScaleTo ( background.gameObject, iTween.Hash (
			"y", 0.0001,
			"time", 0.25,
			"oncompletetarget", this.gameObject,
			"oncomplete", "GoTo" + pageName
		) );
		
	}
	
	public function GoToEditor () {
		Application.LoadLevel ( "editor" );
	}

	public function ExitGame () {
		Application.Quit ();	
	}
}
