#pragma strict

public enum eDoorType {
	SingleSwing,
	DoubleSwing,
	SingleSlide,
	DoubleSlide
}

class Door extends InteractiveObject {
	public var locked : boolean = false;
	public var lockLevel : int = 1;
	public var lockKeyGUID : String = "";
	public var closed : boolean = true;
	public var type : eDoorType = eDoorType.SingleSwing;
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
		targetRot = startRot;
	
		closed = true;
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
			targetPosLeft = startPosLeft - this.transform.right;
			targetPosRight = startPosRight + this.transform.right;
		
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
		if ( leftDoor && rightDoor ) {
			// Start positions
			startPosLeft = leftDoor.transform.localPosition;
			startPosRight = rightDoor.transform.localPosition;
			targetPosLeft = startPosLeft;
			targetPosRight = startPosRight;
		}

		// Colliders
		if ( type == eDoorType.DoubleSlide ) {
			if ( !GameCore.running ) {
				leftDoor.collider.enabled = false;
				rightDoor.collider.enabled = false;
			} else {
				this.collider.enabled = false;
			}
		}	
	
		CheckState ( this.transform );
	}
	
	function UpdateObject () {
		if ( GameCore.running ) {
			switch ( type ) {
				case eDoorType.SingleSwing:
					this.transform.localRotation = Quaternion.Slerp ( this.transform.localRotation, Quaternion.Euler ( 0, targetRot.y, 0 ), Time.deltaTime * 2 );
					break;
			
				case eDoorType.DoubleSlide:
					if ( leftDoor && rightDoor ) {
						leftDoor.transform.localPosition = Vector3.Slerp ( leftDoor.transform.localPosition, targetPosLeft, Time.deltaTime * 2 );
						rightDoor.transform.localPosition = Vector3.Slerp ( rightDoor.transform.localPosition, targetPosRight, Time.deltaTime * 2 );
					}
			}
		}

		Debug.DrawLine ( this.transform.position, frontPos, Color.green );
		Debug.DrawLine ( this.transform.position, backPos, Color.red );
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
