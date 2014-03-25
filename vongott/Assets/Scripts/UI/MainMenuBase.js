#pragma strict

class MainMenuBase extends OGPage {
	public var background : Transform;
	public var clampEdge : MeshRenderer; 
	
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
		
		iTween.ValueTo ( this.gameObject, iTween.Hash (
			"from", 5,
			"to", 1,
			"time", 0.2,
			"onupdate", "UpdateBackgroundBrightness"
		) );
		
		iTween.ValueTo ( this.gameObject, iTween.Hash (
			"from", 0,
			"to", 0.2,
			"time", 0.15,
			"onupdate", "UpdateEdgeTiling"
		) );
	}

	public function UpdateEdgeTiling ( val : float ) {
		clampEdge.materials[1].mainTextureOffset.y = -val;
	}

	public function UpdateBackgroundBrightness ( val : float ) {
		background.renderer.material.SetFloat ( "_Brightness", val );
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
		
		iTween.ValueTo ( this.gameObject, iTween.Hash (
			"from", 1,
			"to", 10,
			"delay", 0.05,
			"time", 0.2,
			"onupdate", "UpdateBackgroundBrightness"
		) );
		
		iTween.ValueTo ( this.gameObject, iTween.Hash (
			"from", 0.2,
			"to", 0,
			"time", 0.15,
			"onupdate", "UpdateEdgeTiling"
		) );
	}
	
	public function GoToEditor () {
		Application.LoadLevel ( "editor" );
	}

	public function ExitGame () {
		Application.Quit ();	
	}
}
