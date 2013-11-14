#pragma strict

class InputManager extends MonoBehaviour {
	public static var escFunction : Function;
	
	private var player : PlayerController;
	
	private function GameCameraControls () {
		if ( Input.GetKeyDown ( KeyCode.F4 ) ) {
			GameCamera.GetInstance().ToggleFirstPerson ();
		}
	}
	
	private function MovementControls () {
		
	}
	
	private function MenuControls () {
		// Menu navigation
		if ( GameCore.state == eGameState.Menu ) {
			
		
		// Menu shortcuts
		} else {
			
		
		}
	}
	
	function Update () {
		// Get instances
		if ( !player ) {
			player = GameCore.GetPlayerObject().GetComponentInChildren(PlayerController);
		}
	
		// The escape key can always be used
		if ( Input.GetKeyDown ( KeyCode.Escape ) && escFunction != null ) {
			escFunction ();
		}
		
		// In-game controls
		if ( GameCore.controlsActive ) {
			GameCameraControls ();
			MovementControls ();
			MenuControls ();
		
		// Menus
		} else {
			MenuControls ();
		
		}
	}
}