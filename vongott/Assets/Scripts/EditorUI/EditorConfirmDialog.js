#pragma strict

class EditorConfirmDialog extends OGPage {
	public var label : OGLabel;
	public var yesButton : OGButton;
	public var noButton : OGButton;
	
	static var sender : String = "";
	static var yesAction : Function = null;
	static var noAction : Function = null;
	static var message : String = "";
	static var singleButton : boolean = false;

	function Yes () {
		if ( yesAction != null ) {
			OGRoot.GetInstance().GoToPage ( sender );
			yesAction ();
		} 
	}
	
	function No () {
		if ( noAction != null && sender != "" ) {
			OGRoot.GetInstance().GoToPage ( sender );
			noAction ();
			Clear ();
		} else if ( sender != "" ) {
			OGRoot.GetInstance().GoToPage ( sender );
			Clear ();
		}
	}
	
	function Close () {
		if ( sender != "" ) {
			OGRoot.GetInstance().GoToPage ( sender );
			Clear ();
		}
	}
	
	function Clear () {
		sender = "";
		yesAction = null;
		noAction = null;
		message = "";
		singleButton = false;
	}
	
	override function StartPage () {
		label.text = message;
		
		if ( singleButton ) {
			yesButton.transform.localPosition = new Vector3 ( 140, 40, -2 );
			noButton.gameObject.SetActive ( false );
		
		} else {
			yesButton.gameObject.SetActive ( true );
			noButton.gameObject.SetActive ( true );
		
			yesButton.transform.localPosition = new Vector3 ( 70, 40, -2 );
			noButton.transform.localPosition = new Vector3 ( 210, 40, -2 );
		
		}
	}
}