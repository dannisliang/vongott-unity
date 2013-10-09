#pragma strict

class Terminal extends InteractiveObject {
	public var cameras : SurveillanceCamera[] = new SurveillanceCamera[3];
	public var passCode : String = "";
	
	private var tempPos : Vector3;
	private var tempRot : Vector3;
	private var inSession : boolean = false;
		
	public function LoginSuccess () {
		UITerminalDisplay.currentCameras = cameras;
		
		OGRoot.GoToPage ( "TerminalDisplay" );
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
		
		GameCamera.GetInstance().SetBlur ( false );
		iTween.MoveTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "position", tempPos, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
		iTween.RotateTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "rotation", tempRot, "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
	
		yield WaitForSeconds ( 1 );
	
		GameCore.ToggleControls ( true );
	}
	
	// Handle use
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Use [LeftMouse]" );
	}
	
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive && !inSession ) {
			tempPos = GameCamera.GetInstance().transform.position;
			tempRot = GameCamera.GetInstance().transform.eulerAngles;
	
			GameCamera.GetInstance().SetBlur ( true );
			StartCoroutine ( Enter () );
		
		} else if ( Input.GetKeyDown(KeyCode.Escape) && inSession ) {
			OGRoot.GoToPage ( "HUD" );
			UILoginDisplay.Clear ();
			UIComputerDisplay.Clear ();
			
			StartCoroutine ( Exit () );
		
		}
		
		
	}
	
	function Start () {
		if ( EditorCore.running ) {
			this.GetComponent ( SphereCollider ).enabled = false;
		}
	}
}