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
	
	private static var capsule : CapsuleCollider;
	private static var distGround : float = float.PositiveInfinity;
	private static var isClimbing : boolean = false;
	private static var inCrawlspace : boolean = false;
	private static var isGrounded : boolean = true;

	public static function SetControlMode ( mode : ePlayerControlMode ) {
		controlMode = mode;
	}

	public static function SetClimbing ( state : boolean ) {
		isClimbing = state;

		GameCore.Print ( "PlayerController | " + ( isClimbing ? "Started climbing" : "Stopped climbing" ) );
	}

	public static function Update ( player : Player ) {
		if ( !capsule ) {
			capsule = player.transform.collider as CapsuleCollider;
		}
	
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
		if ( Input.GetKeyDown ( KeyCode.Space ) ) {
			if ( bodyState != ePlayerBodyState.Crouching && bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling ) {
				bodyState = ePlayerBodyState.Jumping;

				if ( InputManager.jumpFunction != null ) {
					InputManager.jumpFunction ();
					InputManager.jumpFunction = null;
				}
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
		if ( Input.GetMouseButton ( 0 ) ) {
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
		
		if ( deltaVertical != 0.0 || deltaHorizontal != 0.0 ) {
			// Direction
			if ( controlMode == ePlayerControlMode.ThirdPerson ) {
				ThirdPersonController.Update ( player, deltaVertical, deltaHorizontal );
			
			} else {
				FirstPersonController.Update ( player, deltaVertical, deltaHorizontal );
			
			}
			
			// ^ TEMPORARY CONTROLS FOR CLIMBING ( waiting for animation )
			if ( bodyState == ePlayerBodyState.Climbing ) {
				if ( deltaVertical > 0.1 ) {
					player.transform.localPosition += new Vector3 ( 0, Time.deltaTime, 0 );
				} else if ( deltaVertical < -0.1 ) {
					player.transform.localPosition -= new Vector3 ( 0, Time.deltaTime, 0 );
				}
			}

			// Sprint
			if ( Input.GetKey ( KeyCode.LeftShift ) && bodyState != ePlayerBodyState.Crouching && bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling ) {
			
			// Walk
			} else {				
				if ( deltaVertical > 0.5 ) { deltaVertical = 0.5; }
				else if ( deltaVertical < -0.5 ) { deltaVertical = -0.5; }
				
				if ( deltaHorizontal > 0.5 ) { deltaHorizontal = 0.5; }
				else if ( deltaHorizontal < -0.5 ) { deltaHorizontal = -0.5; }
			
			}
			
		} else {
			if ( bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling && bodyState != ePlayerBodyState.Crouching ) {
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
