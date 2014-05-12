#pragma strict

class Keypad extends InteractiveObject {
	public var doorGUID : String = "";
	public var door : Door;
	public var passCode : String;
	public var difficulty : int = 1;
	
	private var tempPos : Vector3;
	private var tempRot : Vector3;
	private var inSession : boolean = false;
		
	
	//////////////////
	// Main functions
	//////////////////
	public function LoginSuccess () {
		if ( door ) {
			door.locked = !door.locked;
		}
		
		Exit ();
	}
	
	public function ShowLogin ( ){
		UIKeypadDisplay.passCode = passCode;
		UIKeypadDisplay.successCallback = LoginSuccess;
		UIHUD.GetInstance().ShowNotification ( "" );
		OGRoot.GetInstance().GoToPage ( "KeypadDisplay" );
	}
	
	public function Enter () : IEnumerator {
		inSession = true;
		
		GameCore.GetInstance().SetControlsActive ( false );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.3 );
		
		ShowLogin ();
	}
	
	public function Exit () : IEnumerator {
		inSession = false;
		
		OGRoot.GetInstance().GoToPage ( "HUD" );
		
		iTween.MoveTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "position", tempPos, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
		iTween.RotateTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "rotation", tempRot, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
	
		yield WaitForSeconds ( 1 );
	
	
		GameCore.GetInstance().SetControlsActive ( true );
	}
							
	//////////////////
	// Init
	//////////////////
	function Start () {
	}
	
	
	//////////////////
	// Update
	//////////////////
	override function Interact () {
		if ( !inSession ) {
			tempPos = GameCamera.GetInstance().transform.position;
			tempRot = GameCamera.GetInstance().transform.eulerAngles;
	
			StartCoroutine ( Enter () );
		
			InputManager.escFunction = function () {
				UILoginDisplay.Clear ();
				UIComputerDisplay.Clear ();
				
				StartCoroutine ( Exit () );
			};
		}
	}
	
	override function UpdateObject () {
		if ( !GameCore.running ) { return; }
		
		if ( doorGUID != "" && door == null ) {
			var obj : GameObject = GameCore.GetObjectFromGUID ( doorGUID );
			
			if ( obj ) {
				door = obj.GetComponent ( Door );
			}
		}
		
		if ( door ) {
			if ( door.locked ) {
				this.renderer.materials[2].color = Color.red;
			} else {
				this.renderer.materials[2].color = Color.green;
			}
		}
	}
}
