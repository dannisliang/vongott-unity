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
			var inventory : OSInventory = GameCore.GetInventory ();

			// Stash
			if ( Input.GetKeyDown ( KeyCode.Alpha1 ) ) {
				inventory.SetQuickSlotEquipped ( 0 );

			} else if ( Input.GetKeyDown ( KeyCode.Alpha2 ) ) { 
				inventory.SetQuickSlotEquipped ( 1 );

			} else if ( Input.GetKeyDown ( KeyCode.Alpha3 ) ) { 
				inventory.SetQuickSlotEquipped ( 2 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha4 ) ) { 
				inventory.SetQuickSlotEquipped ( 3 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha5 ) ) { 
				inventory.SetQuickSlotEquipped ( 4 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha6 ) ) { 
				inventory.SetQuickSlotEquipped ( 5 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha7 ) ) { 
				inventory.SetQuickSlotEquipped ( 6 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha8 ) ) { 
				inventory.SetQuickSlotEquipped ( 7 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha9 ) ) { 
				inventory.SetQuickSlotEquipped ( 8 );
			
			} else if ( Input.GetKeyDown ( KeyCode.Alpha0 ) ) { 
				inventory.SetQuickSlotEquipped ( 9 );

			// Flashlight
			} else if ( Input.GetKeyDown ( KeyCode.F ) ) {
				GameCamera.GetInstance().ToggleFlashlight ();

			// Menu shortcuts
			} else if ( Input.GetKeyDown(KeyCode.I) ) {
				OGRoot.GetInstance().GoToPage ( "Inventory" );

			} else if ( Input.GetKeyDown(KeyCode.Q) ) {
				OGRoot.GetInstance().GoToPage ( "Quests" );
			
			} else if ( Input.GetKeyDown(KeyCode.U) ) {
				OGRoot.GetInstance().GoToPage ( "SkillTree" );
			
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
	}
}
