#pragma strict

class MainMenu extends MonoBehaviour {
	private class Buttons {
		var newGame : OGButton3D;
		var loadGame : OGButton3D;
		var options : OGButton3D;
		var community : OGButton3D;
	}
	
	var logo : Transform;
	var logoSpeed : float = 10.0;	
	var rimTween : OGTween;
	var buttons : Buttons;
	
	@HideInInspector var nextPage : String;
	
	function Start () {
		
	}
	
	function GoToPage () {
		OGRoot.GoToPage ( nextPage );
	}
	
	function SetButtons ( state : boolean ) {
		buttons.newGame.enabled = state;
		buttons.loadGame.enabled = state;
		buttons.options.enabled = state;
		buttons.community.enabled = state;
	}
	
	function Transition ( page : String ) {
		if ( page == "" ) {
			rimTween.sendMessageOn = OGTween.TweenMessageSend.Begin;
			rimTween.Play ( false );
			SetButtons ( true );
		
		} else {
			rimTween.sendMessageOn = OGTween.TweenMessageSend.Complete;
			rimTween.Play ( true );
			SetButtons ( false );
		
		}
		
		nextPage = page;
	}
	
	function Update () {
		logo.localEulerAngles = new Vector3 ( logo.localEulerAngles.x, logo.localEulerAngles.y + ( logoSpeed * Time.deltaTime ), logo.localEulerAngles.z );
	}
}
