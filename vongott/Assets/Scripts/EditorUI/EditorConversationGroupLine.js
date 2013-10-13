#pragma strict

class EditorConversationGroupLine extends MonoBehaviour {
	var index : OGLabel;
	var consequence : OGButton;
	var consequenceBool : OGTickBox;
	var line : OGTextField;
	var endConvo : OGPopUp;
	var gameEvent : OGButton;
	
	function SetIndex ( i : int ) {
		if ( i == 0 ) {
			index.text = "A";
		} else if ( i == 1 ) {
			index.text = "B";
		} else if ( i == 2 ) {
			index.text = "C";
		}
	}

	public function PickEvent ( btn : OGButton ) {
		if ( btn.hiddenString != "" ) {
			EditorEditEvent.eventCode = btn.hiddenString;
		}
		
		EditorEditEvent.sender = "Conversations";
		
		EditorEditEvent.callback = function ( e : String ) {
			btn.hiddenString = e;
			btn.text = e.Substring ( 0, 9 );
		};
		
		OGRoot.GoToPage ( "EditEvent" );
	}

	function Update () {
		if ( consequence.text == "(none)" ) { consequenceBool.isChecked = false; }
	}
}