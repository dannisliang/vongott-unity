#pragma strict

class Book extends InteractiveObject {
	public var content : String;
	
	private var inSession : boolean = false;
	
	// Handle read
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Read [LeftMouse]" );
	}
	
	public function Enter () : IEnumerator {
		inSession = true;		
		
		UIHUD.ToggleCrosshair ();
		UIHUD.ShowNotification ( "" );
		UITextDisplay.displayText = content;
		
		GameCamera.GetInstance().SetBlur ( true );
		GameCamera.GetInstance().StorePosRot ();
		
		GameCore.ToggleControls ( false );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.3 );
		
		OGRoot.GoToPage ( "TextDisplay" );
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
	
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive && !inSession ) {
			StartCoroutine ( Enter () );
		
			GameCore.interactiveObjectLocked = true;
		
		} else if ( Input.GetKeyDown(KeyCode.Escape) && inSession ) {
			OGRoot.GoToPage ( "HUD" );
			
			StartCoroutine ( Exit () );
			
			GameCore.interactiveObjectLocked = false;
		
		}
	}
	
	function Start () {
		if ( EditorCore.running ) {
			Destroy ( this.rigidbody );			
		}
	}
}