#pragma strict

class EditorConfirmDialog extends OGPage {
	var label : OGLabel;
	
	static var sender : String = "";
	static var yesAction : Function = null;
	static var noAction : Function = null;
	static var message : String = "";

	function Yes () {
		if ( yesAction != null ) {
			yesAction ();
			OGRoot.GoToPage ( sender );
		} 
	}
	
	function No () {
		if ( noAction != null && sender != "" ) {
			noAction ();
			OGRoot.GoToPage ( sender );
			Clear ();
		} else if ( sender != "" ) {
			OGRoot.GoToPage ( sender );
			Clear ();
		}
	}
	
	function Close () {
		if ( sender != "" ) {
			OGRoot.GoToPage ( sender );
			Clear ();
		}
	}
	
	function Clear () {
		sender = "";
		yesAction = null;
		noAction = null;
		message = "";
	}
	
	override function UpdatePage () {
		label.text = message;
	}
}