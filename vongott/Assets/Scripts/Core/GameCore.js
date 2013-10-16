#pragma strict

////////////////////
// Prerequiites
////////////////////
// Public vars
var _levelContainer : Transform;

public var selectedOutlineColor : Color;
public var deselectedOutlineColor : Color;

// Private vars
private var tempCamPos : Vector3;
private var tempCamRot : Vector3;

// Static vars
static var debuggingEnabled = true;
static var playerName = "Nameless";
static var interactiveObject : GameObject;

static var playerObject:GameObject;
static var scanner:AStarScanner;

static var started = false;
static var controlsActive = true;

static var currentLevel : GameObject;
static var nextLevel : String = "";
static var nextSpawnPoint : String = "";

static var levelContainer : Transform;

static var instance : GameCore;

public var timeScale : float = 1.0;
public var ignoreTimeScale : float = 0.0;
public var tempTimeScale : float = 1.0;
public var timeScaleGoal : float = 1.0;


////////////////////
// Player
////////////////////
static function GetPlayerObject () : GameObject {
	return playerObject;
}

static function GetPlayer () : Player {
	return playerObject.GetComponent(Player);
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
	
	Camera.main.GetComponent(GameCamera).enabled = state;
	
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
	playerObject = Instantiate ( Resources.Load ( "Actors/Player/Player" ) ) as GameObject;
	playerObject.transform.parent = currentLevel.transform;
	
	playerObject.layer = 9;	
	
	scanner.Init ();
	//MergeMeshes ();

	GoToSpawnPoint ( spawnPoint );
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
// Regular
function SetPause ( state : boolean ) {
	if ( state ) {		
		tempTimeScale = timeScale;
		
		iTween.StopByName ( "TimeScaleTween" );
		SetTimeScale ( 0 );

	} else {
		iTween.StopByName ( "TimeScaleTween" );
		
		if ( tempTimeScale != timeScaleGoal ) {
			TweenTimeScale ( tempTimeScale, timeScaleGoal, 1.0 );
		
		} else {
			SetTimeScale ( tempTimeScale );
		
		}
	}
}

// Timescale
function SetTimeScaleGoal ( goal : float ) {
	timeScaleGoal = goal;
}

function TweenTimeScale ( start : float, goal : float, time : float ) {
	iTween.ValueTo ( this.gameObject, iTween.Hash (
		"name", "TimeScaleTween",
		"from", start,
		"to", goal,
		"onupdate", "SetTimeScale",
		"ignoretimescale", true,
		"time", time
	) );
	
	timeScaleGoal = goal;
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

// Find player
function FindPlayer () {
	var player : Player = GameObject.FindObjectOfType ( Player );
	playerObject = player.gameObject;
	Debug.Log ( "GameCore | Found player: " + playerObject );
}

// Find spawn point
public static function GoToSpawnPoint ( s : String ) {
	var currentSpawnPoint : SpawnPoint;
	
	Debug.Log ( "GameCore | Searching for SpawnPoint '" + s + "'..." );
				
	for ( var c : Component in GameCore.levelContainer.GetComponentsInChildren ( SpawnPoint ) ) {
		currentSpawnPoint = c as SpawnPoint;
		
		if ( currentSpawnPoint.gameObject.name == s ) {
			Debug.Log ( "GameCore | ...found!" );
			break;
		}
	}
	
	Debug.Log ( "GameCore | ...failed!" );
	
	playerObject.transform.position = currentSpawnPoint.transform.position;
	
	var newRot : Vector3 = currentSpawnPoint.transform.localEulerAngles;
	newRot.x = 0;
	newRot.z = 0;
	
	playerObject.transform.localEulerAngles = newRot;
}

// Find object from GUID
public static function GetObjectFromGUID ( id : String ) : GameObject {
	if ( !started ) { return; }
	
	for ( var c : Component in levelContainer.GetComponentsInChildren(GUID) ) {
		if ( (c as GUID).GUID == id ) {
			return c.gameObject;
		}
	}
	
	return null;
}

// Start
function Start () {	
	// Instance
	instance = this;
	
	if ( !started ) {
		// Quests
		QuestManager.Init();
		
		// Inventory
		InventoryManager.Init();
		
		// Upgrades
		UpgradeManager.Init();
		
		// Flags
		FlagManager.Init();
	}
	
	// Level container
	levelContainer = _levelContainer;
	
	// AStar scanner
	scanner = this.GetComponent(AStarScanner);
		
	// Load level
	if ( nextLevel != "" ) {
		LoadLevel ( nextLevel, nextSpawnPoint );
	}
	
	nextLevel = "";
	nextSpawnPoint = "";
	
	// Player
	FindPlayer ();
		
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
	if ( playerObject == null ) {
		FindPlayer ();
	}
	
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
	if ( debuggingEnabled ) {
		GUI.Label ( Rect ( 10, 10, Screen.width, Screen.height / 4 ), debugString );
	}
}