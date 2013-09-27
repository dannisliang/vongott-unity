class Door extends InteractiveObject {
	var closed : boolean = true;
	var startRot : Vector3;
	var targetRot : Vector3;
	
	// Prompt
	override function InvokePrompt () {
		if ( closed ) {
			UIHUD.ShowNotification ( "Open [F]" );
		
		} else {
			UIHUD.ShowNotification ( "Close [F]" );
		
		}
	}
	
	// Movement
	private function ToggleDoor ( pos : Vector3 ) {
		targetRot = startRot;
		
		if ( closed ) {
			var frontPos : Vector3 = this.transform.forward * 2;
			var backPos : Vector3 = -this.transform.forward * 2;			
			
			if ( Vector3.Distance ( pos, backPos ) < Vector3.Distance ( pos, frontPos ) ) {
				targetRot.y += 90;
			} else {
				targetRot.y -= 90;
			}
			
			closed = false;
		
		} else {
			closed = true;
		
		}
	}
	
	function Start () {
		startRot = this.transform.localEulerAngles;
		targetRot = startRot;
	}
	
	function UpdateObject () {
		if ( !EditorCore.running ) {
			this.transform.localEulerAngles = Vector3.Slerp ( this.transform.localEulerAngles, targetRot, Time.deltaTime * 2 );
		}
	}
	
	// Interaction
	override function NPCCollide ( a : Actor ) {
		if ( closed ) {
			ToggleDoor ( a.transform.position );
		}
	}
	
	override function Interact () {
		if ( Input.GetKeyDown(KeyCode.F) ) {
			ToggleDoor ( GameCore.GetPlayerObject().transform.position );
			
			UIHUD.ShowNotification ( "" );
		}
	}
}