#pragma strict

////////////////////
// Prerequiites
////////////////////
// Public vars
var _levelContainer : Transform;

// Static vars
static var debuggingEnabled = true;
static var playerName = "Nameless";
static var interactiveObject:GameObject;

static var playerObject:GameObject;
static var camTarget:GameObject;
static var cam:Transform;

static var started = false;

static var currentChapter : Chapter;
static var currentScene : Scene;
static var currentLevel : GameObject;
static var nextLevel : String;

static var levelContainer : Transform;


////////////////////
// Player
////////////////////
static function GetPlayerObject () : GameObject {
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
	
	MouseLook.SetActive ( state );
	
	if ( state ) {
		Print ( "GameCore | controls activated" );
	} else {
		Print ( "GameCore | controls deactivated" );
	}
}


////////////////////
// Load level
////////////////////
static function LoadLevel ( path : String ) {
	if ( currentLevel != null ) {
		Destroy ( currentLevel );
		currentLevel = null;
	}
	
	currentLevel = Loader.LoadMap ( path );
	
	currentLevel.transform.parent = levelContainer;
	currentLevel.transform.localPosition = Vector3.zero;
	
	/// BLAAAA
	playerObject = Instantiate ( Resources.Load ( "Prefabs/Character/Player" ) ) as GameObject;
	playerObject.transform.parent = currentLevel.transform;
	playerObject.transform.localPosition = Vector3.one;
	
	camTarget = Instantiate ( Resources.Load ( "Prefabs/Core/CameraTarget" ) ) as GameObject;
	camTarget.transform.parent = currentLevel.transform;
	camTarget.GetComponent ( CameraTarget ).player = playerObject;
	camTarget.GetComponent ( CameraTarget ).cam = cam.gameObject;
}


////////////////////
// Go to editor
////////////////////
static function GoToEditor () {
	EditorCore.initPos = Camera.main.transform.position;
	EditorCore.initRot = Camera.main.transform.eulerAngles;
	EditorCore.initMap = currentLevel.name;
	
	Stop ();
	
	Application.LoadLevel ( "editor" );
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
	
	// flags
	FlagManager.Init();
	
	// main camera
	cam = Camera.main.transform;
	
	// level container
	levelContainer = _levelContainer;
	
	// load level
	if ( nextLevel == "" ) { nextLevel == "DudeMeister"; }
	LoadLevel ( nextLevel );
	
	// signal
	Print ("GameCore | started");
	started = true;
}


////////////////////
// Clear
////////////////////
static function Stop () {	
	// quests
	QuestManager.Clear();
	
	// inventory
	InventoryManager.Clear();
	
	// upgrades
	UpgradeManager.Clear();

	started = false;
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