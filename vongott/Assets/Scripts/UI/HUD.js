// Game objects and tweens
var conversation:GameObject;
var conversation_top:TweenScale;
var conversation_bottom:TweenScale;
var conversation_name:UILabel;
var conversation_line:UILabel;
var conversation_option1:UILabel;
var conversation_option2:UILabel;
var conversation_option3:UILabel;

var status:GameObject;

var prompt:TweenScale;
var prompt_input:UIInput;
var prompt_instructions:UILabel;
var prompt_ok:GameObject;
var prompt_cancel:GameObject;
var prompt_title:UILabel;

// Booleans
static var hud_active = true;
static var start_convo = false;
static var exit_convo = false;
static var update_convo = false;
static var open_prompt = false;

// CONVERSATIONS
static var convo_current_name = "";
static var convo_current_line = "";
static var convo_current_option1 = "";
static var convo_current_option2 = "";
static var convo_current_option3 = "";

private function ResetConversation () {
	conversation_name.text = "";
	conversation_line.text = "";
	conversation_option1.text = "";
	conversation_option2.text = "";
	conversation_option3.text = "";
}

private function UpdateConversation () {
	conversation_name.text = convo_current_name;
	conversation_line.text = convo_current_line;
	conversation_option1.text = convo_current_option1;
	conversation_option2.text = convo_current_option2;
	conversation_option3.text = convo_current_option3;
}

private function EnterConversation () {
	conversation_bottom.callWhenFinished = null;
	ToggleHUD();

	conversation_top.Play(true);
	conversation_bottom.Play(true);

	UpdateConversation();
}

private function LeaveConversation () {
	conversation_bottom.callWhenFinished = "ToggleHUD";

	conversation_top.Play(false);
	conversation_bottom.Play(false);
	
	ResetConversation();
}

// PROMPT
static var prompt_current_instructions = "";
static var prompt_current_title = "";
static var prompt_current_cancel = false;
static var prompt_current_convo:Conversation;

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

function ClosePrompt () {
	prompt.Play ( false );
	prompt_current_instructions = "";
	prompt_current_title = "";
	prompt_current_cancel = false;
	prompt_current_convo = null;
}

function PromptOK () {
	if ( prompt_input.label.text != "" ) {
		GameCore.player_name = prompt_input.label.text;
	}
	
	if ( prompt_current_convo ) {
		prompt_current_convo.NextLine();
	}
	
	ClosePrompt();
}

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
	
	if ( open_prompt ) {
		open_prompt = false;
		OpenPrompt ();
	}
}