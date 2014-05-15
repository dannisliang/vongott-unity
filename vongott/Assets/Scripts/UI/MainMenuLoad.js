#pragma strict

import System.IO;

class MainMenuLoad extends OGPage {
	public var slots : OGListItem[];
	public var background : Transform;
	public var clampEdge : MeshRenderer; 
	public var clampLight1 : Light;
	public var clampLight2 : Light;

	private function TrimFileName ( p : String ) : String {
		var path : String[] = p.Split("/"[0]);
		
		if ( Application.platform == RuntimePlatform.WindowsEditor || Application.platform == RuntimePlatform.WindowsPlayer ) {
			path = p.Split("\\"[0]);
		}
		
		var fileName : String = path[path.Length-1];
		var extention : String [] = fileName.Split("."[0]);
		var name : String = extention[0];
		
		return name;
	}

	private function PopulateMaps () {
		var files : String[] = Directory.GetFiles ( Application.dataPath + "/Maps", "*.map" );

		for ( var i : int = 0; i < slots.Length; i++ ) {
			if ( i < files.Length ) {
				var mapName : String = TrimFileName ( files[i] );
				slots[i].text = mapName;
				slots[i].argument = mapName;
				slots[i].isDisabled = false;
			} else {
				slots[i].isDisabled = true;
			}		
		}
	}
	
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

		PopulateMaps ();
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
