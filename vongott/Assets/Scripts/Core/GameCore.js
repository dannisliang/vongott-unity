#pragma strict

////////////////////
// Prerequiites
////////////////////
// Static vars
static var debugging_enabled = true;
static var player_name = "Nameless";
static var interactive_object:GameObject;
static var player_object:GameObject;
static var started = false;


////////////////////
// Player
////////////////////
static function SetPlayerObject ( obj:GameObject ) {
	player_object = obj;
}

static function GetPlayerObject () {
	return player_object;
}


////////////////////
// Interactions
////////////////////
static function SetInteractiveObject ( obj : GameObject ) {
	interactive_object = obj;
	
	if ( obj ) {
		Print ( "GameCore | interactive object set to: " + obj );
	} else {
		Print ( "GameCore | interactive object released" );
	}
}

static function GetInteractiveObject () {
	return interactive_object;
}


////////////////////
// Controls
////////////////////
static function ToggleControls ( state : boolean ) {
	player_object.GetComponent(CharacterController).enabled = state;
	player_object.GetComponent(ThirdPersonController).enabled = state;
	
	if ( state ) {
		Print ( "GameCore | controls activated" );
	} else {
		Print ( "GameCore | controls deactivated" );
	}
}


////////////////////
// Init
////////////////////
function Start () {	
	// quests
	QuestManager.Init();
	
	// inventory
	InventoryManager.Init();
	
	// upgrades
	UpgradeManager.Init();
	
	Print ("GameCore | started");
}


////////////////////
// Update
////////////////////
function Update () {

}


////////////////////
// Debug
////////////////////
static function Print ( msg : String ) {
	if ( debugging_enabled ) {
		Debug.Log ( msg );
	}
}