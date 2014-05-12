#pragma strict

////////////////////
// Prerequiites
////////////////////
// Enums
public enum eGameState {
	Game,
	Menu
}

public class MapData {
	public var name : String = "MapName";
	public var musicCalm : String = "";
	public var musicAggressive : String = "";
	public var ambientLight : Color;
	public var fogEnabled : boolean = false;
	public var fogColor : Color;
	public var fogDensity : float = 0.01;
}

class GameCore extends MonoBehaviour {
	// Public vars
	var _levelContainer : Transform;
	
	public var selectedOutlineColor : Color;
	public var deselectedOutlineColor : Color;
	public var player : Player;

	// Private vars
	private var tempCamPos : Vector3;
	private var tempCamRot : Vector3;

	// Static vars
	static var debuggingEnabled = true;
	static var playerName = "Nameless";
	static var interactiveObject : InteractiveObject;
	static var interactiveObjectLocked : boolean = false;
	
	static var state : eGameState;
	static var scanner : OPScanner;
	
	static var running = false;
	
	static var currentLevel : GameObject;
	static var currentLevelData : MapData;
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
	public static function GetPlayerObject () : GameObject {
		return instance.player.gameObject;
	}
	
	public static function GetPlayer () : Player {
		return instance.player;
	}


	////////////////////
	// Actors
	////////////////////
	public static function GetActors () : OACharacter[] { 
		return levelContainer.GetComponentsInChildren.<OACharacter>();
	}


	////////////////////
	// Interactions
	////////////////////
	static function SetInteractiveObject ( obj : InteractiveObject ) {
		interactiveObject = obj;
	}
	
	static function GetInteractiveObject () : InteractiveObject {
		return interactiveObject;
	}
	
	
	////////////////////
	// Controls
	////////////////////
	public function GetControlsActive () : boolean {
		return !InputManager.isLocked && state != eGameState.Menu;
	}

	public function SetControlsActive ( state : boolean ) {
		InputManager.isLocked = !state;
	}
	
	public function SetControlsActive ( state : boolean, delay : float ) {
		StartCoroutine ( ExecuteWithDelay ( function () { SetControlsActive ( state ); }, delay ) );
	}

	
	////////////////////
	// Load level
	////////////////////
	public function LoadLevel ( path : String, spawnPoint : String ) : IEnumerator {
		Time.timeScale = 0;

		this.GetComponent.< OPScanner > ().Clear ();

		// Check if a level is already loaded
		if ( currentLevel != null ) {
			var skybox : SkyBox = GameObject.FindObjectOfType.<SkyBox>();

			if ( skybox != null ) {
				Destroy ( skybox.gameObject );
			}

			player.transform.parent = currentLevel.transform.parent;
			Destroy ( currentLevel );
			currentLevel = null;
		}
		
		// Read .map file
		currentLevel = new GameObject ( "Map" );
		currentLevel.transform.parent = levelContainer;
		OFReader.LoadChildren ( currentLevel.transform, path );
		
		// Nest under level container
		currentLevel.transform.parent = levelContainer;
		currentLevel.transform.localPosition = Vector3.zero;
		
		// Instantiate and position player
		yield WaitForEndOfFrame ();
		
		GoToSpawnPoint ( spawnPoint );
		SetPlayerSpeaker ();

		Time.timeScale = 1;
		
		if ( currentLevelData ) {
			MusicManager.GetInstance().LoadCalm ( currentLevelData.musicCalm );	
			MusicManager.GetInstance().LoadAggressive ( currentLevelData.musicAggressive );	

			MusicManager.GetInstance().PlayCalm ();
		}

		// Set trigger event links
		for ( var t : OATrigger in levelContainer.GetComponentsInChildren.< OATrigger > () ) {
			t.eventHandler = this.gameObject;
		}

		// Scan navmesh
		this.GetComponent.< OPScanner > ().Scan ();
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
		
		SetTimeScaleGoal ( goal );
	}
	
	function SetTimeScale ( time : float ) {
		timeScale = time;
		timeScaleGoal = timeScale;
	}
	
	
	////////////////////
	// Init
	////////////////////
	// Instance
	static function GetInstance () : GameCore {
		return instance;
	}

	public static function GetInventory () : OSInventory {
		return instance.GetPlayer().inventory;
	}

	public static function GetConversationManager () : OCManager {
		return instance.GetComponent.< OCManager > ();
	}
	
	public static function GetEventManager () : EventManager {
		return instance.GetComponent.< EventManager > ();
	}
	
	public static function GetUpgradeManager () : UpgradeManager {
		return instance.GetComponent.< UpgradeManager > ();
	}

	// Set player as "player" speaker
	public function SetPlayerSpeaker () {
		for ( var a : OACharacter in levelContainer.GetComponentsInChildren.< OACharacter > () ) {
			if ( a.conversationTree ) {
				for ( var i : int = 0; i < a.conversationTree.speakers.Length; i++ ) {
					if ( a.conversationTree.speakers[i].id == "Player" ) {
						a.convoSpeakers[i] = player.gameObject;
						a.UpdateSpeakers ();
					}
				}
			}
		}
	}

	// Find spawn point
	public function GoToSpawnPoint ( sName : String ) {
		var currentSpawnPoint : SpawnPoint;
		
		Debug.Log ( "GameCore | Searching for SpawnPoint '" + sName + "'..." );
					
		for ( var s : SpawnPoint in GameCore.levelContainer.GetComponentsInChildren.< SpawnPoint >() ) {
			currentSpawnPoint = s;
			
			if ( currentSpawnPoint.gameObject.name == sName ) {
				Debug.Log ( "GameCore | ...found!" );
				break;
			}
		}
		
		Debug.Log ( "GameCore | ...failed!" );
		
		player.transform.parent = levelContainer;

		if ( currentSpawnPoint ) {
			player.transform.position = currentSpawnPoint.transform.position;
			var newRot : Vector3 = currentSpawnPoint.transform.localEulerAngles;
			newRot.x = 0;
			newRot.z = 0;
			
			player.transform.localEulerAngles = newRot;
		}

	}
	
	// Find object from GUID
	public static function GetObjectFromGUID ( id : String ) : GameObject {
		if ( !running ) { return null; }
		
		for ( var c : Component in levelContainer.GetComponentsInChildren(OFSerializedObject) ) {
			if ( (c as OFSerializedObject).id == id ) {
				return c.gameObject;
			}
		}
		
		return null;
	}
	
	// Start
	function Awake () {
		// Instance
		instance = this;
	}
	
	function Start () {	
		if ( !running ) {
			// Quests
			QuestManager.Init();
		}
		
		// Level container
		levelContainer = _levelContainer;
		
		// AStar scanner
		scanner = this.GetComponent(OPScanner);
		
		// Player
		if ( !player.gameObject.activeInHierarchy ) {
			player = Instantiate ( player );
		}	

		// Load level
		if ( nextLevel != "" ) {
			StartCoroutine ( LoadLevel ( nextLevel, nextSpawnPoint ) );
		}
		
		nextLevel = "";
		nextSpawnPoint = "";
		
		// Signal
		Print ("GameCore | Started");
		running = true;
	}
	
	
	////////////////////
	// Clear
	////////////////////
	function OnDisable () {
		Stop ();
	}
	
	static function Stop () {	
		// Quests
		QuestManager.Clear();
		
		// Upgrades
		GetUpgradeManager().Clear();
	
		running = false;
	}
	
	
	////////////////////
	// Debug
	////////////////////
	static var debugString : String = "";
	private var frameCounter : int = 0;
	private var timeCounter : float = 0.0f;
	private var lastFramerate : float = 0.0f;
	private var refreshTime : float = 0.5f;

	static function Print ( msg : String ) {
		debugString += "\n\n" + System.DateTime.Now.ToString("HH:mm:ss") + "\n" + msg;
		Debug.Log ( msg );
	}
	
	static function Error ( msg : String ) {
		debugString += "\n\n" + System.DateTime.Now.ToString("HH:mm:ss") + "\n[ERROR] " + msg;
		Debug.LogError ( msg );
	}
	
	function OnGUI () {
		if ( debuggingEnabled ) {
			if ( lastFramerate > 50 ) { GUI.color = Color.green; }
			else if ( lastFramerate > 30 ) { GUI.color = Color.yellow; }
			else { GUI.color = Color.red; }
			
			GUI.Label ( Rect ( 10, Screen.height - 30, 100, 20 ), "FPS " + Mathf.Floor ( lastFramerate ) );
			
			GUI.color = Color.white;
		}
	}
	
	
	////////////////////
	// Update
	////////////////////
	public function ExecuteWithDelay ( func : Function, time : float ) : IEnumerator {
		yield WaitForSeconds ( time );
	
		func ();
	}
	
	function Update () {
		Time.timeScale = timeScale;
		
		if ( timeScale > 0 ) {
			Time.fixedDeltaTime = 0.02 * timeScale;
		}
		
		ignoreTimeScale = Time.deltaTime * Mathf.Pow ( timeScale, -1.0 );
	
	
		if ( timeCounter < refreshTime ) {
			timeCounter += Time.deltaTime;
			frameCounter++;
		
		} else {
			lastFramerate = frameCounter / timeCounter;
			frameCounter = 0;
			timeCounter = 0.0f;
		}

		timeScale = Mathf.Lerp ( timeScale, timeScaleGoal, Time.deltaTime * 10 );
	}
}
