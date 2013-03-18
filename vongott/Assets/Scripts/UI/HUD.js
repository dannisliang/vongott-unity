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

// Booleans
var hud_active:boolean = true;
static var start_convo = false;
static var exit_convo = false;
static var update_convo = false;

// Variables
static var convo_current_name = "";
static var convo_current_line = "";
static var convo_current_option1 = "";
static var convo_current_option2 = "";
static var convo_current_option3 = "";

private function ToggleHUD () {
	hud_active = !hud_active;
	status.SetActiveRecursively(hud_active);
}

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


function Start () {
	ResetConversation();
}

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
}