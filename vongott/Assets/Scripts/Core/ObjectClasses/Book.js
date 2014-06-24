#pragma strict

class Book extends InteractiveObject {
	public var content : String;
	
	private var inSession : boolean = false;
	
	// Handle read
	public function Enter () : IEnumerator {
		inSession = true;		
		
		UIHUD.GetInstance().ToggleCrosshair ();
		UIHUD.GetInstance().ShowNotification ( "" );
		UITextDisplay.displayText = content;
		
		GameCamera.GetInstance().StorePosRot ();
		
		GameCore.GetInstance().SetControlsActive ( false );
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.3 );
		
		OGRoot.GetInstance().GoToPage ( "TextDisplay" );
	}
	
	public function Exit () {
		inSession = false;
		
		GameCamera.GetInstance().RestorePosRot ();
			
		UIHUD.GetInstance().ToggleCrosshair ();
	
		GameCore.GetInstance().SetControlsActive ( true );
	}
	
	override function Interact () {
		if ( !inSession ) {
			StartCoroutine ( Enter () );
		
			GameCore.interactiveObjectLocked = true;
		
			InputManager.escFunction = function () {
				OGRoot.GetInstance().GoToPage ( "HUD" );
				
				Exit ();
				
				GameCore.interactiveObjectLocked = false;
			};
		}
	}
	
	function Start () {
		if ( !GameCore.running ) {
			Destroy ( this.rigidbody );			
		}
	}
}
