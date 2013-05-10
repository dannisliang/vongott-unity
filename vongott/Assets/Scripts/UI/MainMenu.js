#pragma strict

class MainMenu extends MonoBehaviour {
	var logo : Transform;
	var logoSpeed : float = 10.0;	
	var rimTween : OGTween;
	
	@HideInInspector var nextPage : String;
	
	function Start () {
		
	}
	
	function NewGame () {
		Application.LoadLevel ( "game" );
	}
	
	function GoToPage () {
		OGRoot.GoToPage ( nextPage );
	}
	
	function Transition ( page : String ) {
		if ( page == "" ) {
			rimTween.sendMessageOn = OGTween.TweenMessageSend.Begin;
			rimTween.Play ( false );
		} else {
			rimTween.sendMessageOn = OGTween.TweenMessageSend.Complete;
			rimTween.Play ( true );
		}
		
		nextPage = page;
	}
	
	function Update () {
		logo.localEulerAngles = new Vector3 ( logo.localEulerAngles.x, logo.localEulerAngles.y + ( logoSpeed * Time.deltaTime ), logo.localEulerAngles.z );
	}
}
