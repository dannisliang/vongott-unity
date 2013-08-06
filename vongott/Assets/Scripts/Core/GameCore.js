#pragma strict

////////////////////
// Prerequiites
////////////////////
// Public vars
var _levelContainer : Transform;
var _playerObject : GameObject;
var _scanner : AStarScanner;

// Static vars
static var debuggingEnabled = true;
static var playerName = "Nameless";
static var interactiveObject : GameObject;

static var playerObject:GameObject;
static var camTarget:GameObject;
static var cam:Transform;
static var scanner:AStarScanner;

static var started = false;
static var controlsActive = true;

static var currentLevel : GameObject;
static var nextLevel : String = "";

static var levelContainer : Transform;

static var instance : GameCore;

public var timeScale : float = 1.0;
public var ignoreTimeScale : float = 0.0;
public var tempTimeScale : float = 1.0;

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
	playerObject.GetComponent(PlayerController).enabled = state;
	
	MouseLook.SetActive ( state );
	
	controlsActive = state;
	
	if ( state ) {
		Print ( "GameCore | controls activated" );
	} else {
		Print ( "GameCore | controls deactivated" );
	}
}


////////////////////
// Load level
////////////////////
static function LoadLevel ( path : String, spawnPoint : String ) {
	// Check if a level is already loaded
	if ( currentLevel != null ) {
		Destroy ( currentLevel );
		currentLevel = null;
	}
	
	// Read .vgmap file
	currentLevel = Loader.LoadMap ( path );
	
	// Nest under level container
	currentLevel.transform.parent = levelContainer;
	currentLevel.transform.localPosition = Vector3.zero;
	
	// Instantiate and position player
	playerObject = Instantiate ( Resources.Load ( "Actors/Player/Beta" ) ) as GameObject;
	playerObject.transform.parent = currentLevel.transform;
	
	playerObject.transform.localPosition = Vector3.one;
	playerObject.transform.localEulerAngles = Vector3.zero;
	playerObject.layer = 9;	
	
	// Find spawn point
	for ( var o : Object in currentLevel.GetComponentsInChildren ( SpawnPoint ) ) {
		var spt : SpawnPoint = o as SpawnPoint;
		
		//if ( spawnPoint == "" ) { spawnPoint == spt.gameObject.name; }
		
		//if ( spt.gameObject.name == spawnPoint ) {
			playerObject.transform.localPosition = spt.transform.localPosition;
			playerObject.transform.localEulerAngles = spt.transform.localEulerAngles;
			spt.gameObject.SetActive ( false );
		//}
	}
	
	// Instantiate and position camera target
	camTarget = Instantiate ( Resources.Load ( "Prefabs/Core/CameraTarget" ) ) as GameObject;
	camTarget.transform.parent = currentLevel.transform;
	camTarget.GetComponent ( CameraTarget ).player = playerObject;
	camTarget.GetComponent ( CameraTarget ).cam = cam.gameObject;
	
	scanner.Init ();
	//MergeMeshes ();
}


////////////////////
// Events
////////////////////
static function StartAnimation ( n : String, f : Function ) {
	/* TODO: Implicit downcast - revise this logic
	
	for ( var anim : OGTween in currentLevel.transform.GetComponentsInChildren ( OGTween ) ) {
		if ( anim.gameObject.name == n ) {
			anim.func = f;
			anim.Play ( true );
		}
	}*/
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
// Pause
////////////////////
// Blur
function SetPause ( state : boolean ) {
	Camera.main.GetComponent ( BlurEffect ).enabled = state;
	
	if ( state ) {
		ToggleControls ( false );
		
		tempTimeScale = timeScale;
		
		iTween.StopByName ( "TimeScaleTween" );
		SetTimeScale ( 0 );

	} else {
		iTween.StopByName ( "TimeScaleTween" );
		SetTimeScale ( tempTimeScale );
		
		ToggleControls ( true );
		
	}
}

// Timescale
function TweenTimeScale ( start : float, goal : float, time : float ) {
	iTween.ValueTo ( this.gameObject, iTween.Hash (
		"name", "TimeScaleTween",
		"from", start,
		"to", goal,
		"onupdate", "SetTimeScale",
		"ignoretimescale", true,
		"time", time
	) );
}

function SetTimeScale ( time : float ) {
	timeScale = time;
}

////////////////////
// Init
////////////////////
// Instance
static function GetInstance() : GameCore {
	return instance;
}

// Start
function Start () {	
	// Instance
	instance = this;
	
	// Quests
	QuestManager.Init();
	
	// Inventory
	InventoryManager.Init();
	
	// Upgrades
	UpgradeManager.Init();
	
	// Flags
	FlagManager.Init();
		
	// Main camera
	cam = Camera.main.transform;
	
	// Level container
	levelContainer = _levelContainer;
	
	// AStar scanner
	scanner = _scanner;
	
	// Load level
	if ( nextLevel != "" ) {
		LoadLevel ( nextLevel, "" );
	} else {
		playerObject = _playerObject;
	}
	
	// Signal
	Print ("GameCore | started");
	started = true;
}


////////////////////
// Clear
////////////////////
static function Stop () {	
	// Quests
	QuestManager.Clear();
	
	// Inventory
	InventoryManager.Clear();
	
	// Upgrades
	UpgradeManager.Clear();

	started = false;
}


////////////////////
// Update
////////////////////
function Update () {
	Time.timeScale = timeScale;
	
	if ( timeScale > 0 ) {
		Time.fixedDeltaTime = 0.02 * timeScale;
	}
	
	ignoreTimeScale = Time.deltaTime * Mathf.Pow ( timeScale, -1.0 );
}


////////////////////
// Debug
////////////////////
static var debugString : String = "";

static function Print ( msg : String ) {
	if ( debuggingEnabled ) {
		debugString = msg + "\n" + debugString;
		Debug.Log ( msg );
	}
}

static function Error ( msg : String ) {
	if ( debuggingEnabled ) {
		debugString = msg + "\n" + debugString;
		Debug.LogError ( msg );
	}
}

function OnGUI () {
	GUI.Label ( Rect ( 10, 10, Screen.width, Screen.height / 4 ), debugString );
}