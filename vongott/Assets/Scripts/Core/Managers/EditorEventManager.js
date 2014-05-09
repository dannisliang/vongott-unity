#pragma strict

public class EditorEventManager extends MonoBehaviour {
	public function Play () {
		if ( !String.IsNullOrEmpty ( OEWorkspace.GetInstance().currentSavePath ) ) {
			GameCore.nextLevel = OEWorkspace.GetInstance().currentSavePath;

			Application.LoadLevel ( "game" );
		}
	}
}
