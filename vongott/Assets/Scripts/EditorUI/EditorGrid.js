#pragma strict

class EditorGrid extends OGPage {
	var visible : OGTickBox;
	var snap : OGTickBox;
	var darkLine : OGTextField;
	var brightLine : OGTextField;
	
	override function StartPage () {
		visible.isChecked = EditorCore.gridEnabled;
		snap.isChecked = EditorCore.snapEnabled;
		darkLine.text = EditorCore.gridLineDistance.ToString();
		brightLine.text = EditorCore.gridLineBrightFrequency.ToString();
	}
	
	function Cancel () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	function OK () {
		EditorCore.gridEnabled = visible.isChecked;
		EditorCore.snapEnabled = snap.isChecked;
		EditorCore.gridLineDistance = float.Parse ( darkLine.text );
		EditorCore.gridLineBrightFrequency = float.Parse ( brightLine.text );
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
}