#pragma strict

public class OGPage extends MonoBehaviour {
	public var pageName : String = "New Page";

	public function StartPage () {}
	public function UpdatePage () {}
	public function ExitPage () {}

	public function DrawSkin () {}
	public function DrawText () {}
	public function DrawGL () {}

	public function ResetStyles () {
		for ( var w : OGWidget in this.transform.GetComponentsInChildren.<OGWidget>(true) ) {
			OGRoot.GetInstance().skin.GetDefaultStyles ( w );
		}	
	}

}
