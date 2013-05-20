#pragma strict

class UIConversation extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var _actorName : OGLabel;
	var _lines : OGLabel[];
	var _highlight : GameObject;

	// Static vars
	static var actorName : OGLabel;
	static var lines : OGLabel[];
	static var highlight : GameObject;
	static var currentHighlight : int = 0;
	static var convo : Conversation;
	
	
	////////////////////
	// Convo progression
	////////////////////
	// Highlight line
	static function HighlightLine ( index : int ) {
		highlight.transform.localPosition = new Vector3 ( lines[index].transform.localPosition.x - 10, lines[index].transform.localPosition.y - 7.5, 0 );
		currentHighlight = index;
	}

	// Set option
	static function SetOption ( index : int, line : String ) {
		lines[index].text = line;
		
		if ( !highlight.activeSelf ) {
			lines[0].text = "";
			lines[1].text = "";
			lines[2].text = "";
			highlight.SetActive ( true );
		}
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

	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		actorName = _actorName;
		lines = _lines;
		highlight = _highlight;
	}
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.Return ) ) {
			convo.NextEntry ();
		}
	}
}