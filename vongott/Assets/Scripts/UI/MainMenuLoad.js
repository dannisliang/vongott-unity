#pragma strict

import System.IO;

class MainMenuLoad extends OGPage {
	public var slots : OGListItem[];
	public var background : Transform;

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
	}
}
