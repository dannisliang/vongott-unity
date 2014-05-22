#pragma strict

public enum eDoorType {
	Swing,
	Slide
}

class Door extends InteractiveObject {
	public var locked : boolean = false;
	public var lockLevel : int = 1;
	public var keyId : String = "";
	public var closed : boolean = true;
	public var type : eDoorType = eDoorType.Swing;
	public var leftDoor : GameObject;
	public var rightDoor : GameObject;

	private var startRot : Vector3;
	private var targetRot : Vector3;
	private var startPosLeft : Vector3;
	private var startPosRight : Vector3;
	private var targetPosLeft : Vector3;
	private var targetPosRight : Vector3;
	private var frontPos : Vector3;
	private var backPos : Vector3;

	// Lock picking
	private function PickLock ( p : Player ) {
	 	if ( GameCore.GetUpgradeManager().GetAbility ( "Lockpicking" ) >= lockLevel ) {
	  		Unlock ();
	  		UIHUD.GetInstance().ShowNotification ( "Door unlocked" ); 	
		
		} else {
			UIHUD.GetInstance().ShowNotification ( "Skill not high enough" );    
		
		}		
	}
	
	private function Unlock () {
		locked = false;
	}
				
	// Movement
	private function CloseDoor () {
		closed = true;
		CheckState ();
	}

	public function Toggle () {
		ToggleDoor ( this.transform );
	}
	
	public function CheckState () {
		CheckState ( this.transform );
	}

	private function CheckState ( t : Transform ) {
		if ( !closed ) {
			// Swing
			targetRot = startRot;
			
			if ( Vector3.Distance ( t.position, backPos ) < Vector3.Distance ( t.position, frontPos ) ) {
				targetRot.y += 90;
			} else {
				targetRot.y -= 90;
			}
			
			// Slide
			targetPosLeft = startPosLeft - Vector3.right;
			targetPosRight = startPosRight + Vector3.right;
		
		} else {
			// Swing
			targetRot = startRot;
			
			// Slide
			targetPosLeft = startPosLeft;
			targetPosRight = startPosRight;
		
		}
	}

	private function ToggleDoor ( t : Transform ) {
		closed = !closed;

		CheckState ( t );
	}
	
	function Start () {
		// Swing
		// ^ Start rotations
		startRot = this.transform.localEulerAngles;
		targetRot = startRot;
		
		// ^ Determine which way to swing
		frontPos = this.transform.position + this.transform.forward;
		backPos = this.transform.position + -this.transform.forward;

		// Slide
		if ( leftDoor ) {
			startPosLeft = leftDoor.transform.localPosition;
			targetPosLeft = startPosLeft;
		}

		if ( rightDoor ) {
			startPosRight = rightDoor.transform.localPosition;
			targetPosRight = startPosRight;
		}

		// Colliders
		if ( type == eDoorType.Slide ) {
			if ( !GameCore.running ) {
				if ( leftDoor ) { leftDoor.collider.enabled = false; }
				if ( rightDoor ) { rightDoor.collider.enabled = false; }
			}
		}	
	
		CheckState ( this.transform );
	}
	
	function Update () {
		if ( GameCore.running ) {
			switch ( type ) {
				case eDoorType.Swing:
					this.transform.localRotation = Quaternion.Lerp ( this.transform.localRotation, Quaternion.Euler ( 0, targetRot.y, 0 ), Time.deltaTime * 2 );
					break;
			
				case eDoorType.Slide:
					if ( leftDoor ) {
						leftDoor.transform.localPosition = Vector3.Lerp ( leftDoor.transform.localPosition, targetPosLeft, Time.deltaTime * 2 );
					}
				
					if ( rightDoor ) {
						rightDoor.transform.localPosition = Vector3.Lerp ( rightDoor.transform.localPosition, targetPosRight, Time.deltaTime * 2 );
					}
			}

			Debug.DrawLine ( this.transform.position, frontPos, Color.green );
			Debug.DrawLine ( this.transform.position, backPos, Color.red );
		}
	}
		
	// Interaction
	override function NPCCollide ( a : OACharacter ) {
		ToggleDoor ( a.transform );
	}

	override function Interact () {
		if ( locked ) {
			// TODO: Check if player has the right key in inventory
			// 	for ( var k : String in player.keys ) {
			//		if ( k == lockKeyGUID ) {
			//			Unlock ();
			//			return;
			//		}
			//	}
			
			if ( !closed ) {
				CloseDoor ();
			
			} else if ( GameCore.GetPlayer().IsEquippedLockpick() ) {
				PickLock ( GameCore.GetPlayer() );				
			
			} else {
				UIHUD.GetInstance().ShowNotification ( "This door is locked" );
			
			}
		
		} else {
			ToggleDoor ( GameCore.GetPlayerObject().transform );
		
		}
	}
}
