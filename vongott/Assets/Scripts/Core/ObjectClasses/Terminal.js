#pragma strict

class Terminal extends InteractiveObject {
	public var cameraGUIDs : String [] = new String[3];
	public var cameras : SurveillanceCamera[] = new SurveillanceCamera[3];
	public var passCode : String = "";
	public var difficulty : int = 1;
	
	private var inSession : boolean = false;
			
	public function LoginSuccess () {
		UITerminalDisplay.currentCameras = cameras;
		
		OGRoot.GoToPage ( "TerminalDisplay" );
	}
	
	public function ShowLogin ( ){
		UIKeypadDisplay.passCode = passCode;
		UIKeypadDisplay.successCallback = LoginSuccess;
		OGRoot.GoToPage ( "KeypadDisplay" );
	}
	
	public function Enter () : IEnumerator {
		inSession = true;
		UIHUD.ToggleCrosshair ();
		
		GameCamera.GetInstance().SetBlur ( true );
		GameCamera.GetInstance().StorePosRot ();
		
		GameCore.ToggleControls ( false );
		UIHUD.ShowNotification ( "" );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.3 );
		
		ShowLogin ();
	}
	
	public function Exit () : IEnumerator {
		inSession = false;
		
		GameCamera.GetInstance().SetBlur ( false );
		GameCamera.GetInstance().RestorePosRot ( 1 );
			
		yield WaitForSeconds ( 1 );
	
		UIHUD.ToggleCrosshair ();
		InvokePrompt ();
		GameCamera.GetInstance().BlurFocus ( null );
	
		GameCore.ToggleControls ( true );
	}
	
	// Handle use
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Use [LeftMouse]" );
	}
	
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive && !inSession ) {
			StartCoroutine ( Enter () );
		
			GameCore.interactiveObjectLocked = true;
		
		} else if ( Input.GetKeyDown(KeyCode.Escape) && inSession ) {
			OGRoot.GoToPage ( "HUD" );
			UILoginDisplay.Clear ();
			UIComputerDisplay.Clear ();
			
			StartCoroutine ( Exit () );
		
			GameCore.interactiveObjectLocked = false;
		
		}
		
		
	}
	
	override function UpdateObject () {
		if ( EditorCore.running ) { return; }
		
		for ( var i = 0; i < 3; i++ ) {
			if ( cameraGUIDs[i] != "" && cameras[i] == null ) {
				var obj : GameObject = GameCore.GetObjectFromGUID ( cameraGUIDs[i] );
				
				if ( obj ) {
					cameras[i] = obj.GetComponent ( SurveillanceCamera );
				}
			}
		}
	}
	
	function Start () {
		if ( EditorCore.running ) {
		}
	}
}