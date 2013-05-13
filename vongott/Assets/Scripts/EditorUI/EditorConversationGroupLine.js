#pragma strict

class EditorConversationGroupLine extends MonoBehaviour {
	var index : OGLabel;
	var consequence : OGButton;
	var line : OGTextField;
	
	function SetIndex ( i : int ) {
		if ( i == 0 ) {
			index.text = "A";
		} else if ( i == 1 ) {
			index.text = "B";
		} else if ( i == 2 ) {
			index.text = "C";
		}
	}
}