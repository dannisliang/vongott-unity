#pragma strict

class UIDialogBox extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var _title : OGLabel;
	var _instructions : OGLabel;
	var _buttonOK : GameObject;
	var _buttonCancel : GameObject;
	var _input : OGTextField;
	
	// Static vars
	static var title : OGLabel;
	static var instructions : OGLabel;
	static var buttonOK : GameObject;
	static var buttonCancel : GameObject;
	static var input : OGTextField;
	static var convo : Conversation;
	static var action : Function;
	
	
	// Open dialog
	static function Open ( t : String, i : String, useInput : boolean, canCancel : boolean ) {
		title.text = t;
		instructions.text = i;
		
		input.gameObject.SetActive ( useInput );
		
		if ( canCancel ) {
			buttonOK.transform.localPosition = new Vector3 ( 90, 160, 0 );
			buttonCancel.SetActive ( true );
		} else {
			buttonOK.transform.localPosition = new Vector3 ( 150, 160, 0 );
			buttonCancel.SetActive ( false );
		}
	}

	// OK
	function OK () {
		if ( action ) {
			action ();
		}
	
		if ( convo ) {
			OGRoot.GoToPage ( "Conversation" );
			convo.NextEntry();
			
		} else {
			OGRoot.GoToPage ( "HUD" );
		}
	}
	
	// Cancel
	function Cancel () {
		if ( convo ) {
			OGRoot.GoToPage ( "Conversation" );
			convo.NextEntry();
			
		} else {
			OGRoot.GoToPage ( "HUD" );
		}
	}
	

	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		title = _title;
		instructions = _instructions;
		buttonOK = _buttonOK;
		buttonCancel = _buttonCancel;
		input = _input;
		
		MouseLook.SetActive ( false );
	}
}