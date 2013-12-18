#pragma strict

class Book extends InteractiveObject {
	public var content : String;
	
	private var inSession : boolean = false;
	
	// Handle read
	public function Enter () : IEnumerator {
		inSession = true;		
		
		UIHUD.ToggleCrosshair ();
		UIHUD.ShowNotification ( "" );
		UITextDisplay.displayText = content;
		
		GameCamera.GetInstance().StorePosRot ();
		
		GameCore.ToggleControls ( false );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.3 );
		
		OGRoot.GetInstance().GoToPage ( "TextDisplay" );
	}
	
	public function Exit () : IEnumerator {
		inSession = false;
		
		GameCamera.GetInstance().RestorePosRot ( 1 );
			
		yield WaitForSeconds ( 1 );
	
		UIHUD.ToggleCrosshair ();
	
		GameCore.ToggleControls ( true );
	}
	
	override function Interact () {
		if ( !inSession ) {
			StartCoroutine ( Enter () );
		
			GameCore.interactiveObjectLocked = true;
		
			InputManager.escFunction = function () {
				OGRoot.GetInstance().GoToPage ( "HUD" );
				
				StartCoroutine ( Exit () );
				
				GameCore.interactiveObjectLocked = false;
			};
		}
	}
	
	function Start () {
		if ( EditorCore.running ) {
			Destroy ( this.rigidbody );			
		}
	}
}
