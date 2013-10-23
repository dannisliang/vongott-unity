#pragma strict

class Door extends InteractiveObject {
	var locked : boolean = false;
	var lockLevel : int = 1;
	var lockKeyGUID : String = "";
	var closed : boolean = true;
	var startRot : Vector3;
	var targetRot : Vector3;
	
	var frontPos : Vector3;
	var backPos : Vector3;
		
	// Lock picking
	private function PickLock ( p : Player ) {
	 	if ( UpgradeManager.GetAbility(eAbilityID.Lockpicking) >= lockLevel ) {
	  		Unlock ();
	  		UIHUD.ShowNotification ( "Door unlocked" ); 	
		
		} else {
			UIHUD.ShowNotification ( "Skill not high enough" );    
		
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
	
	private function ToggleDoor ( t : Transform ) {
		targetRot = startRot;
		
		if ( closed ) {
			if ( Vector3.Distance ( t.position, backPos ) < Vector3.Distance ( t.position, frontPos ) ) {
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
			this.transform.localRotation = Quaternion.Slerp ( this.transform.localRotation, Quaternion.Euler ( 0, targetRot.y, 0 ), Time.deltaTime * 2 );
		}
	
		Debug.DrawLine ( this.transform.position, frontPos, Color.green );
		Debug.DrawLine ( this.transform.position, backPos, Color.red );
	}
		
	// Interaction
	override function NPCCollide ( a : Actor ) {
		if ( closed ) {
			ToggleDoor ( a.transform );
		}
	}
	
	override function Interact () {
		if ( Input.GetMouseButtonDown(0) && GameCore.controlsActive ) {
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
					UIHUD.ShowNotification ( "This door is locked" );
				
				}
			
			} else {
				ToggleDoor ( GameCore.GetPlayerObject().transform );
			
			}
			
		}
	}
}