#pragma strict

public class UIDeveloperMenu extends OGPage {
	public var inspector : UIDeveloperInspector;

	override function StartPage () {
		GameCore.GetInstance().SetControlsActive ( false );
	}

	function Update () {
		inspector.Update ();
	
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
			GameCore.GetInstance().SetControlsActive ( true );
		}
	}
}
