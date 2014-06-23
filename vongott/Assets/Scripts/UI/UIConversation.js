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
		
	
	////////////////////
	// Convo progression
	////////////////////
	// Highlight line
	static function HighlightOption ( index : int ) {
		highlight.transform.localPosition = new Vector3 ( -20, lines[index].transform.localPosition.y - 7.5, 0 );
		currentHighlight = index;
	}
	
	static function NextOption () {
		if ( currentHighlight < GameCore.GetConversationManager().optionCount - 1 ) {
			HighlightOption ( currentHighlight + 1 );
		}
	}

	static function PreviousOption () {
		if ( currentHighlight > 0 ) {
			HighlightOption ( currentHighlight - 1 );
		}
	}

	// Set option
	static function SetOption ( index : int, line : String ) {
		HighlightOption ( 0 );
		
		if ( !highlight.activeSelf ) {
			lines[0].text = "";
			lines[1].text = "";
			lines[2].text = "";
			highlight.SetActive ( true );
		}
		
		lines[index].text = line;
	}
	
	static function OnSelectOption ( index : int ) {
		highlight.SetActive ( false );

		for ( var i : int = 0; i < lines.Length; i++ ) {
			if ( i != index ) {
				lines[i].text = "";
			}
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
		
		currentHighlight = 0;
	}
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( highlight.activeSelf ) {
			// Let the mouse pick
			for ( var i = 0; i < lines.Length; i++ ) {
				if ( lines[i].CheckMouseOver() ) {
					HighlightOption ( i );
				}
			}
			
			
			if ( Input.GetKeyDown ( KeyCode.Return ) || Input.GetMouseButtonDown(0) ) {
				OCManager.GetInstance().SelectOption ( currentHighlight );
			} else if ( Input.GetKeyDown ( KeyCode.UpArrow ) ) {
				PreviousOption ();
			} else if ( Input.GetKeyDown ( KeyCode.DownArrow ) ) {
				NextOption ();
			}
		
		} else {
			if ( Input.GetKeyDown ( KeyCode.Return ) || Input.GetMouseButtonDown(0) ) {
				OCManager.GetInstance().NextNode ();
			}
		}
	}
}
