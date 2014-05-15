#pragma strict

public class EditorEventManager extends MonoBehaviour {
	public function Play () {
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
