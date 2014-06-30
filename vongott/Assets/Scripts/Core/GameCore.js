#pragma strict

////////////////////
// Prerequiites
////////////////////
// Enums
public enum eGameState {
	Game,
	Menu
}

class GameCore extends MonoBehaviour {
	// Public vars
	public var _levelContainer : Transform;
	public var testing : boolean = false;
	public var selectedOutlineColor : Color;
	public var deselectedOutlineColor : Color;
	public var player : Player;

	// Private vars
	private var tempCamPos : Vector3;
	private var tempCamRot : Vector3;

	// Static vars
	static var overrideSpawnpoint : boolean = false;
	static var overridePosition : Vector3;
	static var overrideRotation : Vector3;
	
	static var debuggingEnabled = true;
	static var playerName = "Nameless";
	static var interactiveObject : InteractiveObject;
	static var interactiveObjectLocked : boolean = false;
	
	static var state : eGameState;
	static var scanner : OPScanner;
	
	static var running = false;
	
	static var currentLevel : GameObject;
	static var nextLevel : String = "";
	static var nextSpawnPoint : String = "";
	
	static var levelContainer : Transform;
	
	static var instance : GameCore;
	
	public var timeScale : float = 1.0;
	public var ignoreTimeScale : float = 0.0;
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

	public static function OverrideSpawnpoint ( pos : Vector3, rot : Vector3 ) {
		overrideSpawnpoint = true;
		overridePosition = pos;
		overrideRotation = rot;
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
		// Clear the OpenPath scanner
		this.GetComponent.< OPScanner > ().Clear ();

		// Check if a level is already loaded
		if ( currentLevel != null ) {
			player.transform.parent = currentLevel.transform.parent;
			Destroy ( currentLevel );
			currentLevel = null;
		}
		
		yield WaitForEndOfFrame ();
		
		// Read .map file
		currentLevel = new GameObject ( "Map" );
		
		var json : JSONObject = OFReader.LoadFile ( path );
	       	var info : JSONObject = json.GetField ( "info" );
	       	var properties : JSONObject;
	       
		if ( info ) {
			properties = info.GetField ( "properties" );
		}
		
		// Deserialise
		OFDeserializer.DeserializeChildren ( json, currentLevel.transform );
		
		// Nest under level container
		currentLevel.transform.parent = levelContainer;
		currentLevel.transform.localPosition = Vector3.zero;
		
		yield WaitForEndOfFrame ();
		
		// Set necessary init values
		GoToSpawnPoint ( spawnPoint );
		
		SetPlayerSpeaker ();
		
		for ( var t : OATrigger in levelContainer.GetComponentsInChildren.< OATrigger > () ) {
			t.eventHandler = this.gameObject;
		}


		if ( properties ) {
			if ( properties.HasField ( "musicCalm" ) ) {
				MusicManager.GetInstance().LoadCalm ( properties.GetField ( "musicCalm" ).str );
				MusicManager.GetInstance().PlayCalm ();
			}
			
			if ( properties.HasField ( "musicAggressive" ) ) {
				MusicManager.GetInstance().LoadAggressive ( properties.GetField ( "musicAggressive" ).str );
			}

			if ( properties.HasField ( "title" ) ) {
				currentLevel.name = properties.GetField ( "title" ).str;
			}
			
			if ( properties.HasField ( "fogEnabled" ) ) {
				RenderSettings.fog = properties.GetField ( "fogEnabled" ).b;
			} else {
				RenderSettings.fog = false;
			}

			if ( properties.HasField ( "fogDensity" ) ) {
				RenderSettings.fogDensity = properties.GetField ( "fogDensity" ).n;
			} else {
				RenderSettings.fogDensity = 0.01;
			}

			if ( properties.HasField ( "quests" ) ) {
				var jsonQuests : JSONObject = OFReader.LoadFile ( Application.dataPath + properties.GetField ( "quests" ).str );

				GetQuestManager().potentialQuests = OCQuestEditor.LoadQuestsFromJSON ( jsonQuests ).ToArray ();		
			}
		}

		// Skydome
		var skydome : OESkydome = GameObject.FindObjectOfType.< OESkydome > ();

		if ( skydome ) {
			skydome.target = player.transform;
			Camera.main.clearFlags = CameraClearFlags.Depth;
		
		} else {
			Camera.main.clearFlags = CameraClearFlags.Skybox;
		
		}

		// Scan navmesh
		this.GetComponent.< OPScanner > ().Scan ();
	}
	
	
	////////////////////
	// Pause
	////////////////////
	// Regular
	function SetPause ( state : boolean ) {
		Time.timeScale = state ? 0 : timeScale;
	}
	
	// Timescale
	function SetTimeScaleGoal ( goal : float ) {
		timeScaleGoal = goal;
	}
	
	function SetTimeScale ( time : float ) {
		timeScaleGoal = time;
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
	
	public static function GetQuestManager () : OCQuests {
		return instance.GetComponent.< OCManager > ().quests;
	}
	
	public static function GetLuaManager () : LuaManager {
		return instance.GetComponent.< LuaManager > ();
	}
	
	public static function GetEventManager () : EventManager {
		return instance.GetComponent.< EventManager > ();
	}
	
	public static function GetDamageManager () : ODManager {
		return instance.GetComponent.< ODManager > ();
	}
	
	public static function GetUpgradeManager () : UpgradeManager {
		return instance.GetComponent.< UpgradeManager > ();
	}

	// Set player as "player" speaker
	public function SetPlayerSpeaker () {
		for ( var a : OACharacter in levelContainer.GetComponentsInChildren.< OACharacter > () ) {
			if ( a.conversationTree ) {
				for ( var i : int = 0; i < a.conversationTree.speakers.Length; i++ ) {
					if ( a.conversationTree.speakers[i] == "Player" ) {
						a.convoSpeakerObjects[i] = player.gameObject;
						a.UpdateSpeakers ();
					}
				}
			}

			a.player = player.gameObject;
		}
	}

	// Find spawn point
	public function GoToSpawnPoint ( sName : String ) {
		if ( overrideSpawnpoint ) {
			overrideSpawnpoint = false;
			player.transform.position = overridePosition;
			player.transform.eulerAngles = overrideRotation;
		
		} else {
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

		if ( testing ) {
			SetPlayerSpeaker ();

			for ( var t : OATrigger in levelContainer.GetComponentsInChildren.< OATrigger > () ) {
				t.eventHandler = this.gameObject;
			}
		}
	}
	
	
	////////////////////
	// Clear
	////////////////////
	function OnDisable () {
		Stop ();
	}
	
	static function Stop () {	
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

		if ( Mathf.Abs ( timeScale - timeScaleGoal ) < 0.05 ) {
			timeScale = timeScaleGoal;
		
		} else {
			timeScale = Mathf.Lerp ( timeScale, timeScaleGoal, Time.deltaTime * 10 );
		
		}

		var ui : OGRoot = OGRoot.GetInstance ();

		if ( ui && ui.currentPage && ui.currentPage.pageName == "HUD" ) {
			Screen.lockCursor = true;
		
		} else {
			Screen.lockCursor = false;
		
		}
				
	}
}
