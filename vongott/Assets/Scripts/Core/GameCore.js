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
	public var sequenceCamera : Camera;
	public var levelContainer : Transform;
	public var highlightColor : Color;
	public var player : Player;
	public var testing : boolean = false;
	public var paused : boolean = false;
	public var serializedObjects : GameObject[] = new GameObject[0];

	// Private vars
	private var tempCamPos : Vector3;
	private var tempCamRot : Vector3;

	// Static vars
	static var overrideSpawnpoint : boolean = false;
	static var overridePosition : Vector3;
	static var overrideRotation : Vector3;
	
	static var debuggingEnabled = true;
	static var interactiveObject : InteractiveObject;
	static var interactiveObjectLocked : boolean = false;
	
	static var state : eGameState;
	static var scanner : OPScanner;
	
	static var running = false;
	
	static var currentLevel : GameObject;
	static var nextLevel : String = "";
	static var nextSpawnPoint : String = "";
	
	static var instance : GameCore;
	
	public var timeScale : float = 1.0;
	public var ignoreTimeScale : float = 0.0;
	public var timeScaleGoal : float = 1.0;

	private var currentPath : String;
	private var currentSpawnpoint : String;

	
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

	public static function SetLayerRecursively ( go : GameObject, layer : int ) {
		go.layer = layer;

		for ( var t : Transform in go.GetComponentsInChildren.< Transform > () ) {
			t.gameObject.layer = layer;
		}
	}


	////////////////////
	// Actors
	////////////////////
	public static function GetActors () : OACharacter[] { 
		return instance.levelContainer.GetComponentsInChildren.<OACharacter>();
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
	public function get controlsActive () : boolean {
		return player.gameObject.GetComponent.< CharacterController > ().enabled;
	}
	
	public function set controlsActive ( value : boolean ) {
		player.gameObject.GetComponent.< CharacterController > ().enabled = value;
	}

	
	////////////////////
	// Load level
	////////////////////
	public function GoToMainMenu () {
		Application.LoadLevel ( "main_menu" );
	}
	
	public function ReloadLevel () {
		OGRoot.GetInstance().GoToPage ( "HUD" );
		StartCoroutine ( LoadLevel ( currentPath, currentSpawnpoint ) );
	}

	public function LoadLevel ( path : String, spawnpoint : String ) : IEnumerator {
		// Remember reload data
		currentPath = path;
		currentSpawnpoint = spawnpoint;

		// Player
		if ( !player.gameObject.activeInHierarchy ) {
			player = Instantiate ( player );
		}

		// Clear the OpenPath scanner
		scanner.Clear ();

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
		GoToSpawnPoint ( spawnpoint );
		
		SetPlayerSpeaker ();
		
		for ( var t : OATrigger in levelContainer.GetComponentsInChildren.< OATrigger > () ) {
			t.eventHandler = GetEventManager ().gameObject;
		}

		for ( var s : OJSequence in levelContainer.GetComponentsInChildren.< OJSequence > () ) {
			s.cam = sequenceCamera;
			s.eventHandler = GetEventManager ().gameObject;
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
		scanner.Scan ();
	}
	
	
	////////////////////
	// Pause
	////////////////////
	// Regular
	function SetPause ( state : boolean ) {
		paused = state;
		Time.timeScale = state ? 0 : timeScale;
		controlsActive = !state;
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
		return instance.GetComponentInChildren.< OCManager > ();
	}
	
	public static function GetQuestManager () : OCQuests {
		return instance.GetComponentInChildren.< OCManager > ().quests;
	}
	
	public static function GetLuaManager () : LuaManager {
		return instance.GetComponentInChildren.< LuaManager > ();
	}
	
	public static function GetEventManager () : EventManager {
		return instance.GetComponentInChildren.< EventManager > ();
	}
	
	public static function GetSkillTree () : OSSkillTree {
		return instance.GetPlayer().skillTree;
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
						
			for ( var s : SpawnPoint in levelContainer.GetComponentsInChildren.< SpawnPoint >() ) {
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
	public function GetObjectFromGUID ( id : String ) : GameObject {
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
		// AStar scanner
		scanner = this.GetComponentInChildren.< OPScanner > ();
		
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
		if ( !paused ) {
			Time.timeScale = timeScale;
		
		} else {
			Time.timeScale = 0;

		}
		
		Screen.lockCursor = OGRoot.GetInstance().currentPage.pageName == "HUD";
		
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

	}
}
