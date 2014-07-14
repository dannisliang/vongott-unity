#pragma strict

class InputManager extends MonoBehaviour {
	public class Axis {
		public var negative : KeyCode;
		public var positive : KeyCode;

		function get delta () : float {
			if ( Input.GetKey ( negative ) ) {
				return -1;
			
			} else if ( Input.GetKey ( positive ) ) {
				return 1;

			} else {
				return 0;

			}
		}
	}

	public class Button {
		public var name : String = "";
		public var key : KeyCode = -1;
		public var mouse : int = -1;
		public var axis : Axis;

		public function get down () : boolean {
			if ( key > 0 ) {
				return Input.GetKey ( key );
			
			} else if ( mouse >= 0 ) {
				return Input.GetMouseButton ( mouse );
			
			} else {
				return false;

			}
		}
		
		public function get pressed () : boolean {
			if ( key > 0 ) {
				return Input.GetKeyDown ( key );
			
			} else if ( mouse >= 0 ) {
				return Input.GetMouseButtonDown ( mouse );
			
			} else {
				return false;

			}
		}
	}

	public var buttons : Button[] = new Button[0];

	public static var instance : InputManager;
	public static var escFunction : System.Action;
	
	public static function GetButtonDown ( n : String ) : boolean {
		for ( var i : int = 0; i < instance.buttons.Length; i++ ) {
			if ( instance.buttons[i].name == n ) {
				return instance.buttons[i].pressed;
			}
		}

		return false;
	}

	public static function GetButton ( n : String ) : boolean {
		for ( var i : int = 0; i < instance.buttons.Length; i++ ) {
			if ( instance.buttons[i].name == n ) {
				return instance.buttons[i].down;
			}
		}

		return false;
	}
	
	public static function GetAxis ( n : String ) : float {
		for ( var i : int = 0; i < instance.buttons.Length; i++ ) {
			if ( instance.buttons[i].name == n ) {
				return instance.buttons[i].axis.delta;
			}
		}

		return 0;
	}

	public function Awake () {
		instance = this;
	}

	public function Update () {
		var ui : OGRoot = OGRoot.GetInstance ();
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
		} else if ( GetButtonDown ( "Flashlight" ) ) {
			GameCamera.GetInstance().ToggleFlashlight ();

		// Menu shortcuts
		} else if ( GetButtonDown ( "Inventory" ) ) {
			ui.GoToPage ( ui.currentPage.pageName == "Inventory" ? "HUD" : "Inventory" );

		} else if ( GetButtonDown ( "Quests" ) ) {
			ui.GoToPage ( ui.currentPage.pageName == "Quests" ? "HUD" : "Quests" );
		
		} else if ( GetButtonDown ( "Skills" ) ) {
			ui.GoToPage ( ui.currentPage.pageName == "SkillTree" ? "HUD" : "SkillTree" );
		
		} else if ( GetButtonDown ( "Console" ) ) {
			UIHUD.GetInstance().ToggleConsole();

		} else if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			var page : String = ui.currentPage.pageName;
			
			if ( escFunction ) {
				escFunction ();
				escFunction = null;

			} else if ( page == "HUD" ) {
				ui.GoToPage ( "Menu" );

			} else if ( page == "Menu" || page == "Inventory" || page == "SkillTree" || page == "Quests" ) {
				ui.GoToPage ( "HUD" );

			}
		}
	}
}
