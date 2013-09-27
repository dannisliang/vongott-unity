class Door extends InteractiveObject {
	var closed : boolean = true;
	var startRot : Vector3;
	var targetRot : Vector3;
	
	var frontPos : Vector3;
	var backPos : Vector3;
	
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
		frontPos = this.transform.position + this.transform.forward;
		backPos = this.transform.position + -this.transform.forward;
	}
	
	function UpdateObject () {
		if ( !EditorCore.running ) {
			this.transform.localEulerAngles = Vector3.Slerp ( this.transform.localEulerAngles, targetRot, Time.deltaTime * 2 );
		}
	
		Debug.DrawLine ( this.transform.position, frontPos, Color.green );
		Debug.DrawLine ( this.transform.position, backPos, Color.red );
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
		
			InvokePrompt ();
		}
	}
}