#pragma strict

////////////////////
// Prerequiites
////////////////////
// Static vars
static var debuggingEnabled = true;
static var playerName = "Nameless";
static var interactiveObject:GameObject;
static var playerObject:GameObject;
static var started = false;

static var currentChapter : Chapter;
static var currentScene : Scene;


////////////////////
// Player
////////////////////
static function SetPlayerObject ( obj:GameObject ) {
	playerObject = obj;
}

static function GetPlayerObject () {
	return playerObject;
}


////////////////////
// Interactions
////////////////////
static function SetInteractiveObject ( obj : GameObject ) {
	interactiveObject = obj;
	
	if ( obj ) {
		Print ( "GameCore | interactive object set to: " + obj );
	} else {
		Print ( "GameCore | interactive object released" );
	}
}

static function GetInteractiveObject () {
	return interactiveObject;
}


////////////////////
// Controls
////////////////////
static function ToggleControls ( state : boolean ) {
	playerObject.GetComponent(CharacterController).enabled = state;
	playerObject.GetComponent(ThirdPersonController).enabled = state;
	
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
	if ( debuggingEnabled ) {
		Debug.Log ( msg );
	}
}