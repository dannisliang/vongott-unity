#pragma strict

private class DialogBox {
	var title : OGLabel;
	var instructions : OGLabel;
	var buttonOK : GameObject;
	var buttonCancel : GameObject;
	var input : OGTextField;
}

class UIConversation extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var _actorName : OGLabel;
	var _lines : OGLabel[];
	var _highlight : GameObject;
	var _dialogBox : DialogBox;

	// Static vars
	static var actorName : OGLabel;
	static var lines : OGLabel[];
	static var highlight : GameObject;
	static var currentHighlight : int = 0;
	static var dialogBox : DialogBox;
	
	
	////////////////////
	// Convo progression
	////////////////////
	// Highlight line
	static function HighlightLine ( index : int ) {
		highlight.transform.parent = lines[index].transform;
		highlight.transform.localPosition = new Vector3 ( -10, -15, 0 );
		currentHighlight = index;
	}

	// Set option
	static function SetOption ( index : int, line : String ) {
		lines[index].text = line;
		highlight.SetActive ( true );
	}
	
	// Set line
	static function SetLine ( line : String ) {
		lines[0].text = line;
		lines[1].text = "";
		lines[2].text = "";
		highlight.SetActive ( false );
	}

	// Set name
	static function SetName ( n : String ) {
		actorName.text = n;
	}

	// Open dialog
	static function OpenDialog ( title : String, instructions : String, useInput : boolean, canCancel : boolean ) {
		dialogBox.title.text = title;
		dialogBox.instructions.text = instructions;
		
		dialogBox.input.gameObject.SetActive ( useInput );
		
		if ( canCancel ) {
			dialogBox.buttonOK.transform.localPosition = new Vector3 ( 90, 160, 0 );
			dialogBox.buttonCancel.SetActive ( true );
		} else {
			dialogBox.buttonOK.transform.localPosition = new Vector3 ( 150, 160, 0 );
			dialogBox.buttonCancel.SetActive ( false );
		}
	}


	////////////////////
	// Init
	////////////////////
	function Start () {
		actorName = _actorName;
		lines = _lines;
		highlight = _highlight;
		dialogBox = _dialogBox;
		
		MouseLook.SetActive ( false );
	}
}