class Door extends InteractiveObject {
	var door_open = false;
	var timer = 0.0;
	
	private function Open () {
		this.animation.Play("door_open");
		door_open = true;
		timer = 1.0;
		
	}
	
	private function Close () {
		this.animation.Play("door_close");
		door_open = false;
		timer = 0.0;
	}
	
	function Toggle () {
		if ( door_open ) {
			Close ();
		} else {
			Open ();
		}
	}
	
	function Start () {
	}
	
	function Update () {
		// Interact
		if ( HUD.showing && GameCore.GetInteractiveObject() == this.gameObject ) {
			if ( !HUD.notification.active ) {
				HUD.ShowNotification ( "Open [F]" );
			}
			
			if ( Input.GetKeyDown(KeyCode.F) ) {
				Toggle();
			}
		}
	
		// Close automatically
		if ( timer > 0.0 ) {
			timer = timer - Time.deltaTime;
					
			if ( timer <= 0.0 ) {
				Close();
			}
		}
	}
}