#pragma strict

public class EditorEventManager extends MonoBehaviour {
	public function Play ( btn : OGButton ) {
		if ( !String.IsNullOrEmpty ( OEWorkspace.GetInstance().currentSavePath ) ) {
			GameCore.nextLevel = OEWorkspace.GetInstance().currentSavePath;
			
			OGRoot.GetInstance().GoToPage ( "Loading" );

			Application.LoadLevel ( "game" );
		}
	}

	public function Exit () {
		Application.LoadLevel ( "main_menu" );
	}
}
