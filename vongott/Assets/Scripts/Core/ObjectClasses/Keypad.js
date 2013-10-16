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
		UIHUD.ShowNotification ( "" );
		OGRoot.GoToPage ( "KeypadDisplay" );
	}
	
	public function Enter () : IEnumerator {
		inSession = true;
		
		GameCore.ToggleControls ( false );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.3 );
		
		ShowLogin ();
	}
	
	public function Exit () : IEnumerator {
		inSession = false;
		
		OGRoot.GoToPage ( "HUD" );
		
		GameCamera.GetInstance().SetBlur ( false );
		iTween.MoveTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "position", tempPos, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
		iTween.RotateTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "rotation", tempRot, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
	
		yield WaitForSeconds ( 1 );
	
		GameCamera.GetInstance().BlurFocus ( null );
	
		GameCore.ToggleControls ( true );
	}
	
	// Handle use
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Use [LeftMouse]" );
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
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive && !inSession ) {
			tempPos = GameCamera.GetInstance().transform.position;
			tempRot = GameCamera.GetInstance().transform.eulerAngles;
	
			GameCamera.GetInstance().SetBlur ( true );
			StartCoroutine ( Enter () );
		
		} else if ( Input.GetKeyDown(KeyCode.Escape) && inSession ) {
			UILoginDisplay.Clear ();
			UIComputerDisplay.Clear ();
			
			StartCoroutine ( Exit () );
		
		}
				
	}
	
	override function UpdateObject () {
		if ( EditorCore.running ) { return; }
		
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