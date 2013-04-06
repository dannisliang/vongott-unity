////////////////////
// Prerequisites
////////////////////
// Classes
private class HUDConversation {
	var instance : GameObject;	
	var top : TweenScale;
	var bottom : TweenScale;
	var name : UILabel;
	var line : UILabel;
	var highlight : GameObject;
	var options : UILabel[];
}

private class HUDPrompt {
	var instance : TweenScale;
	var input : UIInput;
	var instructions : UILabel;
	var ok : GameObject;
	var cancel : GameObject;
	var title : UILabel;
}

private class HUDNotification {
	var instance : TweenPosition;
	var label : UILabel;
	var image : UISprite;
	var active = false;
}

// Inspector items
var _conversation : HUDConversation;
var _notification : HUDNotification;
var _prompt : HUDPrompt;
var _status : GameObject;

// Static references
static var conversation : HUDConversation;
static var notification : HUDNotification;
static var prompt : HUDPrompt;
static var status : GameObject;

// Booleans
static var showing = true;


////////////////////
// Conversations
////////////////////
static var convo_current_options = ["","",""];
static var convo_current_highlight = 1;

// reset
static function ResetConversation () {
	conversation.name.text = "";
	conversation.line.text = "";
	for ( var option in conversation.options ) {
		option.text = "";
		option.color = new Color ( 255, 255, 255, 255 );
	}
	conversation.highlight.active = false;
	
}

// highlight
static function HighlightLine ( num : int ) {
	conversation.highlight.active = true;
	convo_current_highlight = num;
	
	var line = conversation.options[num];
	
	conversation.highlight.transform.localPosition.y = line.gameObject.transform.localPosition.y;
	line.color = new Color ( 0, 0, 0, 255 );
}

// unhighlight
static function UnhighlightLine ( num : int ) {
	conversation.highlight.active = false;
	convo_current_highlight = num;
	
	var line = conversation.options[num];
	line.color = new Color ( 255, 255, 255, 255 );
}

// update
static function UpdateConversation () {
	for ( var i = 0; i < convo_current_options.Length; i++ ) {
		conversation.options[i].text = convo_current_options[i];
	}

	if ( convo_current_options[0] != "" ) {
		HighlightLine( 0 );
	}
}

// enter
static function EnterConversation () {
	conversation.bottom.callWhenFinished = null;
	ToggleHUD();

	conversation.top.Play(true);
	conversation.bottom.Play(true);

	UpdateConversation();
}

// leave
static function LeaveConversation () {
	conversation.bottom.callWhenFinished = "ToggleHUDFromTween";

	conversation.top.Play(false);
	conversation.bottom.Play(false);
	
	ResetConversation();
}

////////////////////
// Notifications
////////////////////
// show
static function ShowNotification ( msg : String ) {
	if ( msg != null && msg != "" ) {
		notification.instance.Play ( true );
		notification.label.text = msg;
		notification.active = true;
	} else {
		notification.instance.Play ( false );
		notification.label.text = "";
		notification.active = false;
	}
}


////////////////////
// Prompt
////////////////////
static var prompt_current_instructions = "";
static var prompt_current_title = "";
static var prompt_current_cancel = false;
static var prompt_current_convo:Conversation;

// open
static function OpenPrompt () {
	prompt.instance.gameObject.SetActiveRecursively ( true );
	
	if ( prompt_current_instructions != "" ) {
		prompt.input.gameObject.SetActiveRecursively ( false );
		
	}
		
	if ( prompt_current_cancel ) {
		prompt.ok.transform.localPosition.x = -60.0;
	} else { 
		prompt.ok.transform.localPosition.x = 0.0;
		prompt.cancel.SetActiveRecursively ( false );
	}
	
	prompt.title.text = prompt_current_title;
	prompt.instructions.text = prompt_current_instructions;
	
	prompt.instance.Play ( true );
}

// close
function ClosePrompt () {
	prompt.instance.Play ( false );
	prompt_current_instructions = "";
	prompt_current_title = "";
	prompt_current_cancel = false;
	prompt_current_convo = null;
}

// press OK
function PromptOK () {
	if ( prompt.input.label.text != "" ) {
		GameCore.player_name = prompt.input.label.text;
	}
	
	if ( prompt_current_convo ) {
		prompt_current_convo.NextLine();
	}
	
	ClosePrompt();
}

// reset
static function ResetPrompt () {
	prompt.instance.gameObject.SetActiveRecursively ( false );
}


////////////////////
// Redirects
////////////////////
private function GoToQuests() {
	for ( var q in QuestManager.GetMainQuests() ) {
		Debug.Log ( q.title + " - " + q.desc );
	}
}


////////////////////
// Toggle HUD
////////////////////
static function ToggleHUD () {
	showing = !showing;
	status.SetActiveRecursively(showing);
}

function ToggleHUDFromTween () {
	showing = !showing;
	status.SetActiveRecursively(showing);
}


////////////////////
// INIT
////////////////////
// Init vars
private function InitVars () {
	conversation = _conversation;
	notification = _notification;
	prompt = _prompt;
	status = _status;
}

// Start
function Start () {
	InitVars();
	ResetConversation();
	ResetPrompt();
	ShowNotification( null );
}


////////////////////
// Update
////////////////////
function Update () {	
	if ( convo_current_options[0] != "" ) {
		if ( Input.GetKeyDown(KeyCode.S) && convo_current_highlight < convo_current_options.Length ) {
			UnhighlightLine ( convo_current_highlight );
			HighlightLine ( convo_current_highlight + 1 );
		} else if ( Input.GetKeyDown(KeyCode.W) && convo_current_highlight > 0 ) {
			UnhighlightLine ( convo_current_highlight );
			HighlightLine ( convo_current_highlight - 1 );
		}
	} else if ( Input.GetKeyDown(KeyCode.Tab) ) {
		GoToQuests();
	}
}