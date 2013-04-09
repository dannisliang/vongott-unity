class Door extends InteractiveObject {
	var next_room:GameObject;
	var prev_room:GameObject;
	
	static var door_open = false;
	var timer = 0.0;
	
	private function ReverseRooms () {
		var new_next = prev_room;
		var new_prev = next_room;
		
		prev_room = new_prev;
		next_room = new_next;
	}
	
	private function SetRoomAlpha ( room : GameObject, a : float ) {
		var all_objects = room.GetComponentsInChildren(MeshRenderer);
		
		for ( var renderer : MeshRenderer in all_objects ) {
			renderer.material.color.a = a;
		}
	}
	
	private function Open () {
		this.animation.Play("door_open");
		door_open = true;
		next_room.SetActive ( true );
		timer = 1.0;
		
		//var player:GameObject = GameCore.GetPlayerObject();
		//player.transform.localPosition = new Vector3 ( this.transform.localPosition.x, player.transform.localPosition.y, this.transform.localPosition.z );
	}
	
	private function Close () {
		this.animation.Play("door_close");
		door_open = false;
		prev_room.SetActive ( false );
		timer = 0.0;
		ReverseRooms();
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
			} else {
				SetRoomAlpha ( prev_room, timer );
				SetRoomAlpha ( next_room, 1.0f - timer );
			}
		}
		
		// Set room visibility
		if ( !next_room.activeSelf && !prev_room.activeSelf ) {
			for ( var renderer in this.gameObject.GetComponentsInChildren(MeshRenderer) ) {
				renderer.enabled = false;
			}
		} else {
			for ( var renderer in this.gameObject.GetComponentsInChildren(MeshRenderer) ) {
				renderer.enabled = true;
			}
		}
	}
}