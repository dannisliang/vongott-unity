#pragma strict

public class UIDeveloperMenu extends OGPage {
	public var flagContainer : OGScrollView;
	
	private var flagManager : OCFlags;

	override function StartPage () {
		GameCore.GetInstance().SetControlsActive ( false );
		
		flagManager = GameCore.GetConversationManager().flags;

		for ( var i : int = 0; i < flagManager.flags.Count; i++ ) {
			var tbx : OGTickBox = new GameObject ( "tbx_" + flagManager.flags[i].id ).AddComponent.< OGTickBox > ();
			tbx.text = flagManager.flags[i].id;
			tbx.isTicked = flagManager.flags[i].b;
			tbx.transform.parent = flagContainer.transform;
			tbx.transform.localScale = new Vector3 ( flagContainer.size.x - flagContainer.padding.x * 2, 20, 1 );
			tbx.transform.localPosition = new Vector3 ( 0, i * 30, 0 );
			tbx.ApplyDefaultStyles ();
		}
	}

	override function ExitPage () {
		for ( var i : int = 0; i < flagContainer.transform.childCount; i++ ) {
			Destroy ( flagContainer.transform.GetChild ( i ).gameObject );
		}
	}

	function Update () {
		for ( var i : int = 0; i < flagContainer.transform.childCount; i++ ) {
			var tbx : OGTickBox = flagContainer.transform.GetChild ( i ).GetComponent.< OGTickBox > ();

			flagManager.Set ( tbx.text, tbx.isTicked );
		}

		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
			GameCore.GetInstance().SetControlsActive ( true );
		}
	}
}
