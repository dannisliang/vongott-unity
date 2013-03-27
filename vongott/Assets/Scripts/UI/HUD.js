// Game objects and tweens
var conversation:GameObject;
var conversation_top:TweenScale;
var conversation_bottom:TweenScale;
var conversation_name:UILabel;
var conversation_line:UILabel;
var conversation_highlight:GameObject;
var conversation_options:UILabel[];

var status:GameObject;

var prompt:TweenScale;
var prompt_input:UIInput;
var prompt_instructions:UILabel;
var prompt_ok:GameObject;
var prompt_cancel:GameObject;
var prompt_title:UILabel;

var notification:TweenPosition;
var notification_label:UILabel;
var notification_image:UISprite;

// Booleans
static var hud_active = true;
static var start_convo = false;
static var exit_convo = false;
static var update_convo = false;
static var open_prompt = false;

// CONVERSATIONS
static var convo_current_name = "dude";
static var convo_current_line = "";
static var convo_current_options = ["","",""];
static var convo_current_highlight = 1;

// reset
private function ResetConversation () {
	conversation_name.text = "";
	conversation_line.text = "";
	for ( var option in conversation_options ) {
		option.text = "";
		option.color = new Color ( 255, 255, 255, 255 );
	}
	conversation_highlight.active = false;
	
}

// highlight
private function HighlightLine ( num : int ) {
	conversation_highlight.active = true;
	convo_current_highlight = num;
	
	var line = conversation_options[num];
	
	conversation_highlight.transform.localPosition.y = line.gameObject.transform.localPosition.y;
	line.color = new Color ( 0, 0, 0, 255 );
}

// unhighlight
private function UnhighlightLine ( num : int ) {
	conversation_highlight.active = false;
	convo_current_highlight = num;
	
	var line = conversation_options[num];
	line.color = new Color ( 255, 255, 255, 255 );
}

// update
private function UpdateConversation () {
	ResetConversation();
	
	conversation_name.text = convo_current_name;
	conversation_line.text = convo_current_line;
	
	for ( var i = 0; i < convo_current_options.Length; i++ ) {
		conversation_options[i].text = convo_current_options[i];
	}

	if ( convo_current_options[0] != "" ) {
		HighlightLine( 0 );
	}
}

// enter
private function EnterConversation () {
	conversation_bottom.callWhenFinished = null;
	ToggleHUD();

	conversation_top.Play(true);
	conversation_bottom.Play(true);

	UpdateConversation();
}

// leave
private function LeaveConversation () {
	conversation_bottom.callWhenFinished = "ToggleHUD";

	conversation_top.Play(false);
	conversation_bottom.Play(false);
	
	ResetConversation();
}

// NOTIFICATION
static var notification_message = "";
private var notification_active = false;

// show
private function ShowNotification ( msg : String ) {
	if ( msg ) {
		notification.Play ( true );
		notification_label.text = msg;
		notification_active = true;
	} else {
		notification.Play ( false );
		notification_label.text = "";
		notification_active = false;
	}
}

// PROMPT
static var prompt_current_instructions = "";
static var prompt_current_title = "";
static var prompt_current_cancel = false;
static var prompt_current_convo:Conversation;

// open
private function OpenPrompt () {
	prompt.gameObject.SetActiveRecursively ( true );
	
	if ( prompt_current_instructions != "" ) {
		prompt_input.gameObject.SetActiveRecursively ( false );
		
	}
		
	if ( prompt_current_cancel ) {
		prompt_ok.transform.localPosition.x = -60.0;
	} else { 
		prompt_ok.transform.localPosition.x = 0.0;
		prompt_cancel.SetActiveRecursively ( false );
	}
	
	prompt_title.text = prompt_current_title;
	prompt_instructions.text = prompt_current_instructions;
	
	prompt.Play ( true );
}

// close
function ClosePrompt () {
	prompt.Play ( false );
	prompt_current_instructions = "";
	prompt_current_title = "";
	prompt_current_cancel = false;
	prompt_current_convo = null;
}

// press OK
function PromptOK () {
	if ( prompt_input.label.text != "" ) {
		GameCore.player_name = prompt_input.label.text;
	}
	
	if ( prompt_current_convo ) {
		prompt_current_convo.NextLine();
	}
	
	ClosePrompt();
}

// reset
private function ResetPrompt () {
	prompt.gameObject.SetActiveRecursively ( false );
}

// TOGGLE HUD
private function ToggleHUD () {
	hud_active = !hud_active;
	status.SetActiveRecursively(hud_active);
}

// INIT
function Start () {	
	ResetConversation();
	ResetPrompt();
}

// UPDATE
function Update () {
	if ( start_convo ) {
		start_convo = false;
		EnterConversation();
	}
	
	if ( exit_convo ) {
		exit_convo = false;
		LeaveConversation();
	} 
	
	if ( update_convo ) {
		update_convo = false;
		UpdateConversation();
	}
	
	if ( notification_message != "" && !notification_active ) {
		ShowNotification ( notification_message );
	} else if ( notification_message == "" ) {
		ShowNotification ( null );
	}
	
	if ( convo_current_options[0] != "" ) {
		if ( Input.GetKeyDown(KeyCode.S) && convo_current_highlight < convo_current_options.Length ) {
			UnhighlightLine ( convo_current_highlight );
			HighlightLine ( convo_current_highlight + 1 );
		} else if ( Input.GetKeyDown(KeyCode.W) && convo_current_highlight > 0 ) {
			UnhighlightLine ( convo_current_highlight );
			HighlightLine ( convo_current_highlight - 1 );
		}
	}
	
	if ( open_prompt ) {
		open_prompt = false;
		OpenPrompt ();
	}
}