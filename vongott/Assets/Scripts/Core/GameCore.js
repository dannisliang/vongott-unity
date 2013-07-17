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

static var currentChapter : Chapter;
static var currentScene : Scene;
static var currentLevel : GameObject;
static var nextLevel : String = "";

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
static function MergeMeshes () {
	var meshFilters = currentLevel.GetComponentsInChildren.<MeshFilter>();
    var combine : CombineInstance[] = new CombineInstance[meshFilters.Length];
    for (var i = 0; i < meshFilters.Length; i++){
        combine[i].mesh = meshFilters[i].sharedMesh;
        combine[i].transform = meshFilters[i].transform.localToWorldMatrix;
        meshFilters[i].gameObject.SetActive( false );
    }
    var mesh : Mesh = new Mesh();
    mesh.CombineMeshes(combine);
    
    currentLevel.AddComponent(MeshFilter).mesh = mesh;
	currentLevel.AddComponent(MeshRenderer);
	currentLevel.AddComponent(MeshCollider).mesh = mesh;
    currentLevel.SetActive ( true );
}

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
	for ( var spt : SpawnPoint in currentLevel.GetComponentsInChildren ( SpawnPoint ) ) {
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
	for ( var anim : OGTween in currentLevel.transform.GetComponentsInChildren ( OGTween ) ) {
		if ( anim.gameObject.name == n ) {
			anim.func = f;
			anim.Play ( true );
		}
	}
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

}


////////////////////
// Debug
////////////////////
static function Print ( msg : String ) {
	if ( debuggingEnabled ) {
		Debug.Log ( msg );
	}
}