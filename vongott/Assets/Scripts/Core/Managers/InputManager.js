#pragma strict

class InputManager extends MonoBehaviour {
	public static var escFunction : Function;
	public static var jumpFunction : Function;
	public static var isLocked : boolean = false;

	private var player : Player;
	
	private function MenuControls () {
		// Menu navigation
		if ( GameCore.state == eGameState.Menu ) {
			

		// In-game
		} else {
			// Stash
			if ( Input.GetKeyDown ( KeyCode.Alpha1 ) ) {
				InventoryManager.GetInstance().ToggleStash ( 0 );

			} else if ( Input.GetKeyDown ( KeyCode.Alpha2 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 1 );

			} else if ( Input.GetKeyDown ( KeyCode.Alpha3 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 2 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha4 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 3 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha5 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 4 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha6 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 5 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha7 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 6 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha8 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 7 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha9 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 8 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha0 ) ) { 
				InventoryManager.GetInstance().ToggleStash ( 9 );

			// Menu shortcuts
			} else if ( Input.GetKeyDown(KeyCode.I) ) {
				OGRoot.GetInstance().GoToPage ( "Inventory" );

			} else if ( Input.GetKeyDown(KeyCode.Q) ) {
				OGRoot.GetInstance().GoToPage ( "Quests" );
			
			} else if ( Input.GetKeyDown(KeyCode.U) ) {
				OGRoot.GetInstance().GoToPage ( "Upgrades" );
			
			} else if ( Input.GetKeyDown(KeyCode.Tab) ) {
				UIHUD.GetInstance().ToggleConsole();

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
		MenuControls ();
		
		if ( GameCore.GetInstance().GetControlsActive() ) {
			PlayerController.Update ( player );
		}
	}
}
