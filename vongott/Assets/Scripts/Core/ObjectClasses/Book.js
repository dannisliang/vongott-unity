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
		
		GameCore.GetInstance().controlsActive = false;
		
		yield GameCamera.GetInstance().FocusInterface ( this.transform, 0.3 );
		
		OGRoot.GetInstance().GoToPage ( "TextDisplay" );
	}
	
	public function Exit () {
		OGRoot.GetInstance().GoToPage ( "HUD" );
		
		inSession = false;
		
		GameCamera.GetInstance().RestorePosRot ();
			
		UIHUD.GetInstance().ToggleCrosshair ();
	
		GameCore.GetInstance().controlsActive = true;
		
		GameCore.interactiveObjectLocked = false;
	}
	
	override function Interact () {
		if ( !inSession ) {
			StartCoroutine ( Enter () );
		
			GameCore.interactiveObjectLocked = true;
		
			InputManager.escFunction = Exit;
		}
	}
	
	function Start () {
		if ( !GameCore.running ) {
			Destroy ( this.rigidbody );			
		}
	}
}
