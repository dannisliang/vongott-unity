#pragma strict

import System.IO;

class MainMenuOptions extends OGPage {
	public var background : Transform;
	public var clampEdge : MeshRenderer; 
	public var clampLight1 : Light;
	public var clampLight2 : Light;

	override function UpdatePage () {
		UpdateBackgroundBrightness ( Random.Range ( 1, 1.2 ) );
	}
	
	private function Transition ( by : float, bf : float, bt : float, ef : float, et : float, func : String ) {
		HideContent ();
		
		iTween.ScaleTo ( background.gameObject, iTween.Hash (
			"y", by,
			"time", 0.25,
			"oncompletetarget", this.gameObject,
			"oncomplete", func
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
	}	
	
	public function UpdateEdgeTiling ( val : float ) {
		clampEdge.materials[1].mainTextureOffset.y = -val;
	}
	
	public function UpdateBackgroundBrightness ( val : float ) {
		background.renderer.material.SetFloat ( "_Brightness", val );
		
		clampLight1.intensity = 2.5 - val;
		clampLight2.intensity = 2.5 - val;
	}

	public function HideContent () {
		this.transform.GetChild(0).gameObject.SetActive ( false );
	}
	
	public function ShowContent () {
		this.transform.GetChild(0).gameObject.SetActive ( true );
	}
	
	public function LoadFile ( mapName : String ) {		
		GameCore.nextLevel = Application.dataPath + "/Maps/" + mapName + ".map";

		Application.LoadLevel ( "game" );
	}

	public function GoBack () {
		Transition ( 0.0001, 1, 10, 0.27, 0, "GoToBase" );
	}

	public function GoToBase () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	override function StartPage () {
		Transition ( 0.96, 5, 1, 0, 0.27, "ShowContent" );
	}
}
