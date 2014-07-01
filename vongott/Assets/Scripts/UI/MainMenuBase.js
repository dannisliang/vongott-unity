#pragma strict

class MainMenuBase extends OGPage {
	public var background : Transform;
	public var clampEdge : GameObject; 
	public var clampLight1 : Light;
	public var clampLight2 : Light;
	
	override function StartPage () {
		var v : Vector3 = background.localScale;
		v.y = 0.0001;
		background.localScale = v;
		
		Transition ( 0.7, 5, 1, 0, 0.2, "ShowContent", false );

		Screen.lockCursor = false;
	}

	override function UpdatePage () {
		UpdateBackgroundBrightness ( Random.Range ( 1, 1.2 ) );
	}

	public function UpdateEdgeTiling ( val : float ) {
		clampEdge.renderer.materials[1].mainTextureOffset.y = -val;
	}

	public function UpdateBackgroundBrightness ( val : float ) {
		background.renderer.material.SetFloat ( "_Brightness", val );

		clampLight1.intensity = 2.5 - val;
		clampLight2.intensity = 2.5 - val;
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

	private function Transition ( by : float, bf : float, bt : float, ef : float, et : float, func : String, spinOut : boolean ) {
		HideContent ();
		
		iTween.ScaleTo ( background.gameObject, iTween.Hash (
			"y", by,
			"time", 0.25,
			"oncompletetarget", this.gameObject,
			"oncomplete", spinOut ? "" : func
		) );
		
		iTween.ValueTo ( this.gameObject, iTween.Hash (
			"from", bf,
			"to", bt,
			"time", 0.25,
			"onupdate", "UpdateBackgroundBrightness"
		) );
		
		iTween.ValueTo ( this.gameObject, iTween.Hash (
			"from", ef,
			"to", et,
			"time", 0.15,
			"onupdate", "UpdateEdgeTiling"
		) );

		if ( spinOut ) {
			iTween.RotateTo ( clampEdge, iTween.Hash (
				"z", 180,
				"delay", 0.25,
				"time", 0.5,
				"easetype", iTween.EaseType.easeInQuad,
				"oncompletetarget", this.gameObject,
				"oncomplete", func
			) );
			
			iTween.MoveTo ( clampEdge, iTween.Hash (
				"z", -4,
				"delay", 0.25,
				"time", 0.5,
				"easetype", iTween.EaseType.easeInQuad
			) );
		}
	}	

	public function GoToPage ( pageName : String ) {
		Transition ( 0.0001, 1, 10, 0.2, 0, "GoTo" + pageName, false );
	}
	
	public function LoadEditor () {
		Application.LoadLevel ( "editor" );
	}

	public function GoToEditor () {
		Transition ( 0.0001, 1, 10, 0.2, 0, "LoadEditor", true );
	}

	public function ExitGame () {
		Application.Quit ();	
	}
}
