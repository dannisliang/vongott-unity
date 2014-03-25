#pragma strict

import System.IO;

class MainMenuLoad extends OGPage {
	public var slots : OGListItem[];
	public var background : Transform;
	public var clampEdge : MeshRenderer; 

	private function TrimFileName ( p : String ) : String {
		var path : String[] = p.Split("/"[0]);
		
		if ( Application.platform == RuntimePlatform.WindowsEditor ) {
			path = p.Split("\\"[0]);
		}
		
		var fileName : String = path[path.Length-1];
		var extention : String [] = fileName.Split("."[0]);
		var name : String = extention[0];
		
		return name;
	}

	private function PopulateMaps () {
		var files : String[] = Directory.GetFiles ( Application.dataPath + "/Maps", "*.vgmap" );

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
	
	public function UpdateEdgeTiling ( val : float ) {
		clampEdge.materials[1].mainTextureOffset.y = -val;
	}
	
	public function UpdateBackgroundBrightness ( val : float ) {
		background.renderer.material.SetFloat ( "_Brightness", val );
	}

	public function HideContent () {
		this.transform.GetChild(0).gameObject.SetActive ( false );
	}
	
	public function ShowContent () {
		this.transform.GetChild(0).gameObject.SetActive ( true );

		PopulateMaps ();
	}
	
	public function LoadFile ( mapName : String ) {		
		LoadingManager.nextScene = mapName;
	
		Application.LoadLevel ( "loading" );
	}

	public function GoBack () {
		HideContent ();
		
		iTween.ScaleTo ( background.gameObject, iTween.Hash (
			"y", 0.0001,
			"time", 0.25,
			"oncompletetarget", this.gameObject,
			"oncomplete", "GoToBase"
		) );
		
		iTween.ValueTo ( this.gameObject, iTween.Hash (
			"from", 1,
			"to", 10,
			"delay", 0.05,
			"time", 0.2,
			"onupdate", "UpdateBackgroundBrightness"
		) );
		
		iTween.ValueTo ( this.gameObject, iTween.Hash (
			"from", 0.27,
			"to", 0,
			"time", 0.15,
			"onupdate", "UpdateEdgeTiling"
		) );
	}

	public function GoToBase () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	override function StartPage () {
		HideContent ();

		iTween.ScaleTo ( background.gameObject, iTween.Hash (
			"y", 0.96,
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
			"to", 0.27,
			"time", 0.15,
			"onupdate", "UpdateEdgeTiling"
		) );
	}
}
