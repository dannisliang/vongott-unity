#pragma strict

class InputManager extends MonoBehaviour {
	public static var escFunction : Function;
	public static var jumpFunction : Function;
	
	private var player : Player;
	
	private function GameCameraControls () {
		if ( Input.GetMouseButtonDown ( 2 ) ) {
			GameCamera.GetInstance().ToggleFirstPerson ();
		}
	}
	
	private function MenuControls () {
		// Menu navigation
		if ( GameCore.state == eGameState.Menu ) {
			
		
		// Menu shortcuts
		} else {
			if ( Input.GetKeyDown(KeyCode.I) ) {
				OGRoot.GetInstance().GoToPage ( "Inventory" );
				
			} else if ( Input.GetKeyDown(KeyCode.Q) ) {
				OGRoot.GetInstance().GoToPage ( "Quests" );
			
			} else if ( Input.GetKeyDown(KeyCode.U) ) {
				OGRoot.GetInstance().GoToPage ( "ModWheel" );
			
			}
		
		}
	}
	
	function Update () {
		// Get instances
		if ( !player ) {
			player = GameCore.GetPlayer();
			return;
		}
	
		// The escape key can always be used
		if ( Input.GetKeyDown ( KeyCode.Escape ) && escFunction != null ) {
			escFunction ();
		}
		
		// In-game controls
		if ( GameCore.controlsActive ) {
			MenuControls ();
			
			if ( GameCore.controlsActive ) {
				PlayerController.Update ( player );
				GameCameraControls ();
			}
		
		// Menus
		} else {
			MenuControls ();
		
		}
	}
}
