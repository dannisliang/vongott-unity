#pragma strict

public class UIDeveloperMenu extends OGPage {
	public var inspector : UIDeveloperInspector;

	override function StartPage () {
		GameCore.GetInstance().controlsActive = false;
	}

	function Update () {
		inspector.Update ();
	
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
			GameCore.GetInstance().controlsActive = true;
		}
	}
}
