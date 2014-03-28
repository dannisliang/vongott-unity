#pragma strict

public class EditorEditMapData extends OGPage {
	public static var loadSettings : boolean = false;
	
	public var fldName : OGTextField;
	public var btnMusicCalm : OGButton;
	public var btnMusicAggressive : OGButton;
	public var tbxFogEnabled : OGTickBox;
	public var sldFogDensity : OGSlider;
	//public var clrFogColor : OGColorPicker;
	//public var clrAmbientLight : OGColorPicker;
	
	override function StartPage () {
		if ( loadSettings ) {	
			fldName.text = EditorCore.currentLevelData.name;
			btnMusicCalm.text = ( EditorCore.currentLevelData.musicCalm == "" ) ? "(none)" : EditorCore.currentLevelData.musicCalm;
			btnMusicAggressive.text = ( EditorCore.currentLevelData.musicAggressive == "" ) ? "(none)" : EditorCore.currentLevelData.musicAggressive;
			tbxFogEnabled.isTicked = EditorCore.currentLevelData.fogEnabled;
			sldFogDensity.sliderValue = EditorCore.currentLevelData.fogDensity;
		
			loadSettings = false;
		}
	}

	public function PickMusic ( btn : OGButton ) {
		EditorOpenFile.baseDir = "Music";
		EditorOpenFile.fileType = "ogg";
		EditorOpenFile.callback = function ( path : String ) {
			OGRoot.GetInstance().GoToPage ( "EditMapData" );
			btn.text = path;
		};

		OGRoot.GetInstance().GoToPage ( "OpenFile" );
	}

	public function Save () {
		EditorCore.currentLevelData.name = fldName.text;
		EditorCore.currentLevelData.musicCalm = btnMusicCalm.text;
		EditorCore.currentLevelData.musicAggressive = btnMusicAggressive.text;
		EditorCore.currentLevelData.fogEnabled = tbxFogEnabled.isTicked;
		EditorCore.currentLevelData.fogDensity = sldFogDensity.sliderValue;
		
		Cancel ();
	}

	public function Cancel () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
}
