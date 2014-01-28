#pragma strict

public enum ePlayerControlMode {
	ThirdPerson,
	FirstPerson
}

public enum ePlayerBodyState {
	Idle,
	Jumping,
	Falling,
	Crouching,
	Climbing
}

public enum ePlayerActionState {
	Idle,
	Shooting,
	Interacting
}

class PlayerController {
	public static var bodyState : ePlayerBodyState = ePlayerBodyState.Idle;
	public static var actionState : ePlayerActionState = ePlayerActionState.Idle;
	public static var controlMode : ePlayerControlMode = ePlayerControlMode.ThirdPerson;
	
	public static var deltaVertical : float;
	public static var deltaHorizontal : float;
	public static var deltaCombined : float;

	public static var isClimbing : boolean = false;
	public static var inCrawlspace : boolean = false;
	public static var isGrounded : boolean = true;
	public static var isRotationLocked : boolean = false;
	public static var useForcedPoint : boolean = false;
	
	private static var distGround : float = float.PositiveInfinity;
	private static var forcedPointVector : Vector3;
	private static var lockedRotationVector : Vector3;
	private static var ladderTopY : float;
	private static var ladderBottomY : float;
	private static var jumpTriggerTimeout : int = 0;

	public static function SetControlMode ( mode : ePlayerControlMode ) {
		controlMode = mode;
	}

	public static function SetClimbing ( state : boolean ) {
		SetClimbing ( state, null );
	}

	public static function SetClimbing ( state : boolean, ladder : Ladder ) {
		isClimbing = state;
		isRotationLocked = state;
		useForcedPoint = state;
		
		if ( ladder ) {
			lockedRotationVector = -ladder.transform.forward;
			forcedPointVector = ladder.transform.position + lockedRotationVector * 0.05;
			ladderBottomY = ladder.GetLowestPoint();
			ladderTopY = ladder.GetHighestPoint();
		}

		GameCore.Print ( "PlayerController | " + ( isClimbing ? "Started climbing" : "Stopped climbing" ) );
	}

	public static function Update ( player : Player ) {
		var capsule : CapsuleCollider = player.transform.collider as CapsuleCollider;
		var groundHit : RaycastHit;
		
		if ( Physics.Raycast ( player.transform.position + Vector3.up * 0.05, -player.transform.up, groundHit, distGround, 9 ) ) {
			distGround = ( player.transform.position - groundHit.point ).sqrMagnitude;
		
		} else {
			distGround = float.PositiveInfinity;
		
		}
		
		isGrounded = distGround < 0.1;
		
		inCrawlspace = bodyState == ePlayerBodyState.Crouching && Physics.Raycast ( player.transform.position, player.transform.up, 1.8, 9 );
		
		// Climbing
		if ( isClimbing ) {
			bodyState = ePlayerBodyState.Climbing;
			player.GetComponent.<Rigidbody>().useGravity = false;
			
		} else {
			player.GetComponent.<Rigidbody>().useGravity = true;
		
		}

		// Jumping
		if ( Input.GetKeyDown ( KeyCode.Space ) && bodyState != ePlayerBodyState.Crouching && bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling ) {
			jumpTriggerTimeout = 10;
		}

		if ( jumpTriggerTimeout > 0 ) {		
			jumpTriggerTimeout--;

			bodyState = ePlayerBodyState.Jumping;

			if ( InputManager.jumpFunction != null ) {
				InputManager.jumpFunction ();
				InputManager.jumpFunction = null;
			}
		
		// Crouching
		} else if ( Input.GetKeyDown ( KeyCode.LeftControl ) && !isClimbing ) {
			if ( bodyState == ePlayerBodyState.Crouching && !inCrawlspace ) {
				bodyState = ePlayerBodyState.Idle;
			
			} else {
				bodyState = ePlayerBodyState.Crouching;
			
			}
	
		}
				
		// Shoot
		if ( Input.GetMouseButton ( 0 ) && InventoryManager.GetInstance().HasEquippedGun() ) {
			actionState = ePlayerActionState.Shooting;
		
		// Interact
		} else if ( Input.GetMouseButtonDown ( 1 ) ) {
			if ( GameCore.GetInteractiveObject() ) {
				actionState = ePlayerActionState.Interacting;
				GameCore.GetInteractiveObject().Interact();
			}
			
		// Idle
		} else {
			actionState = ePlayerActionState.Idle;
		
		}
		
		// Locomotion
		deltaVertical = Input.GetAxisRaw ( "Vertical" );
		deltaHorizontal = Input.GetAxisRaw ( "Horizontal" );
		deltaCombined = 0.0;
	
		// Forced point
		if ( useForcedPoint ) {
			player.transform.position = forcedPointVector;
			useForcedPoint = false;
		}

		if ( deltaVertical != 0.0 || deltaHorizontal != 0.0 ) {
			// Direction
			if ( controlMode == ePlayerControlMode.ThirdPerson ) {
				if ( isRotationLocked ) {
					ThirdPersonController.Update ( player, deltaVertical, lockedRotationVector );

				} else {
					ThirdPersonController.Update ( player, deltaVertical, deltaHorizontal );
				}
			
			} else {
				FirstPersonController.Update ( player, deltaVertical, deltaHorizontal );
			}
			
			// Climbing
			if ( isClimbing ) {
				if ( player.transform.position.y <= ladderBottomY ) {
					deltaVertical = Mathf.Clamp ( deltaVertical, 0, 1 );
				} else if ( player.transform.position.y + 1.8 >= ladderTopY ) {
					deltaVertical = Mathf.Clamp ( deltaVertical, -1, 0 );
				}

			// Sprint
			} else if ( Input.GetKey ( KeyCode.LeftShift ) && bodyState != ePlayerBodyState.Crouching && bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling ) {
			
			// Walk
			} else {				
				deltaVertical = Mathf.Clamp ( deltaVertical, -0.5, 0.5 );
				deltaHorizontal = Mathf.Clamp ( deltaHorizontal, -0.5, 0.5 );
			
			}
			
		} else {
			if ( bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling && bodyState != ePlayerBodyState.Climbing && bodyState != ePlayerBodyState.Crouching ) {
				bodyState = ePlayerBodyState.Idle;
			}
			
		}
		
		// ^ Combined delta
		if ( Mathf.Abs ( deltaVertical ) > Mathf.Abs ( deltaHorizontal ) ) {
			deltaCombined = Mathf.Abs ( deltaVertical );
		} else {
			deltaCombined = Mathf.Abs ( deltaHorizontal );
		}
		
		// Set capsule size
		if ( bodyState == ePlayerBodyState.Crouching ) {
			capsule.height = 0.9;
			capsule.center = new Vector3 ( 0, 0.45, 0 );
		
		} else {
			capsule.height = 1.7;
			capsule.center = new Vector3 ( 0, 0.85, 0 );
		
		}
		
		if ( isGrounded && ( bodyState == ePlayerBodyState.Falling || bodyState == ePlayerBodyState.Jumping ) && bodyState != ePlayerBodyState.Crouching ) {
			bodyState = ePlayerBodyState.Idle;
			
		}
		
		player.GetComponent(Animator).SetFloat ( "DeltaVertical", deltaVertical );
		player.GetComponent(Animator).SetFloat ( "DeltaHorizontal", deltaHorizontal );
		player.GetComponent(Animator).SetFloat ( "DeltaCombined", deltaCombined );

		player.GetComponent(Animator).SetBool ( "Jumping", bodyState == ePlayerBodyState.Jumping || bodyState == ePlayerBodyState.Falling );
		player.GetComponent(Animator).SetBool ( "Crouching", bodyState == ePlayerBodyState.Crouching );
		player.GetComponent(Animator).SetBool ( "Climbing", bodyState == ePlayerBodyState.Climbing );
		player.GetComponent(Animator).SetBool ( "Shooting", actionState == ePlayerActionState.Shooting );
		player.GetComponent(Animator).SetBool ( "Interacting", actionState == ePlayerActionState.Interacting );
		player.GetComponent(Animator).SetBool ( "FirstPerson", controlMode == ePlayerControlMode.FirstPerson );

	}
}
