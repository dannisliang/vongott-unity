#pragma strict

class EditorGrid extends OGPage {
	var visible : OGTickBox;
	var snap : OGTickBox;
	var darkLine : OGTextField;
	var brightLine : OGTextField;
	
	override function StartPage () {
		visible.isTicked = EditorCore.gridEnabled;
		snap.isTicked = EditorCore.snapEnabled;
		darkLine.text = EditorCore.gridLineDistance.ToString();
		brightLine.text = EditorCore.gridLineBrightFrequency.ToString();
	}
	
	function Cancel () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	function OK () {
		EditorCore.gridEnabled = visible.isTicked;
		EditorCore.snapEnabled = snap.isTicked;
		EditorCore.gridLineDistance = float.Parse ( darkLine.text );
		EditorCore.gridLineBrightFrequency = float.Parse ( brightLine.text );
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
}