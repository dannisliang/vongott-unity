#pragma strict

public class EditorEventManager extends MonoBehaviour {
	public function Play ( btn : OGButton ) {
		if ( !String.IsNullOrEmpty ( OEWorkspace.GetInstance().currentSavePath ) ) {
			var popup : OGPopUp = btn.transform.parent.GetComponentInChildren.< OGPopUp > ();
			
			if ( popup.selectedOption == "Cursor" ) {
				GameCore.OverrideSpawnpoint ( OEWorkspace.GetInstance().GetFocus(), Camera.main.transform.eulerAngles );
			}

			GameCore.nextLevel = OEWorkspace.GetInstance().currentSavePath;
			
			OGRoot.GetInstance().GoToPage ( "Loading" );

			Application.LoadLevel ( "game" );
		}
	}

	public function Exit () {
		Application.LoadLevel ( "main_menu" );
	}
}
