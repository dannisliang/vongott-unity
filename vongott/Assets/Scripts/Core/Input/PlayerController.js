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

public class PlayerController extends MonoBehaviour {
	public var bodyState : ePlayerBodyState = ePlayerBodyState.Idle;
	public var actionState : ePlayerActionState = ePlayerActionState.Idle;
	public var controlMode : ePlayerControlMode = ePlayerControlMode.ThirdPerson;
	
	public var deltaVertical : float;
	public var deltaHorizontal : float;
	public var deltaCombined : float;

	public var isClimbing : boolean = false;
	public var inCrawlspace : boolean = false;
	public var isGrounded : boolean = true;
	public var isRotationLocked : boolean = false;
	public var useForcedPoint : boolean = false;
	
	private var distToGround : float = float.PositiveInfinity;
	private var forcedPointVector : Vector3;
	private var lockedRotationVector : Vector3;
	private var ladderTopY : float;
	private var ladderBottomY : float;
	private var player : Player;
	private var character : CharacterController;

	public function SetControlMode ( mode : ePlayerControlMode ) {
		controlMode = mode;
	}

	public function SetClimbing ( state : boolean ) {
		SetClimbing ( state, null );
	}

	public function SetClimbing ( state : boolean, ladder : Ladder ) {
		isClimbing = state;
		isRotationLocked = state;
		useForcedPoint = state;
		
		if ( state ) {
			InventoryManager.GetInstance().HolsterItem();
		} else {
			InventoryManager.GetInstance().UnholsterItem();
		}

		if ( ladder ) {
			lockedRotationVector = -ladder.transform.forward;
			forcedPointVector = ladder.transform.position + lockedRotationVector * 0.05;
			ladderBottomY = ladder.GetLowestPoint();
			ladderTopY = ladder.GetHighestPoint();
		}

		GameCore.Print ( "PlayerController | " + ( isClimbing ? "Started climbing" : "Stopped climbing" ) );
	}

	public function Start () {
		distToGround = collider.bounds.extents.y;
		character = this.GetComponent.<CharacterController>();
	}
	
	public function UpdateThirdPerson () {
		if ( deltaVertical != 0 || deltaHorizontal != 0 ) {
			var targetRotation : float = Camera.main.transform.eulerAngles.y;
			var angle = Mathf.Atan2 ( deltaVertical, -deltaHorizontal ) * Mathf.Rad2Deg;
			targetRotation += angle - 90;

			var rotationQuaternion : Quaternion = Quaternion.Euler ( 0, targetRotation, 0 );
				
			player.transform.rotation = Quaternion.Slerp ( player.transform.rotation, rotationQuaternion, 5 * Time.deltaTime );
		}
	}

	// For locked rotation
	public function UpdateThirdPerson ( lockedRotation : Vector3 ) {
		player.transform.rotation = Quaternion.Slerp ( player.transform.rotation, Quaternion.Euler ( lockedRotation ), 5 * Time.deltaTime );
	}

	public function Update () {
		if ( !GameCore.GetInstance().GetControlsActive() ) {
			return;
		}
		
		if ( !player ) {
			player = this.GetComponent(Player);
		}
		
		isGrounded = Physics.Raycast(transform.position, -Vector3.up, distToGround + 0.1); 
		inCrawlspace = bodyState == ePlayerBodyState.Crouching && Physics.Raycast ( player.transform.position, player.transform.up, 1.8, 9 );
		
		// Climbing
		if ( isClimbing ) {
			bodyState = ePlayerBodyState.Climbing;
		}

		// Jumping
		if ( Input.GetKeyDown ( KeyCode.Space ) && bodyState != ePlayerBodyState.Crouching && bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling ) {
			if ( isGrounded ) {
				bodyState = ePlayerBodyState.Jumping;

				SFXManager.GetInstance().Play ( "sfx_actor_jump_" + Random.Range ( 1, 3 ), this.audio );
			}

			if ( InputManager.jumpFunction ) {
				InputManager.jumpFunction ();
				InputManager.jumpFunction = null;
			}

		// Crouching
		} else if ( Input.GetKeyDown ( KeyCode.LeftControl ) && !isClimbing ) {
			if ( bodyState == ePlayerBodyState.Crouching && !inCrawlspace ) {
				bodyState = ePlayerBodyState.Idle;

				SFXManager.GetInstance().Play ( "sfx_actor_crouch_up_1", this.audio );
			
			} else {
				bodyState = ePlayerBodyState.Crouching;
				
				SFXManager.GetInstance().Play ( "sfx_actor_crouch_down_1", this.audio );
			
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
				deltaVertical = Mathf.Clamp ( deltaVertical, -0.3, 0.3 );
				deltaHorizontal = Mathf.Clamp ( deltaHorizontal, -0.3, 0.3 );
			
			}
			
		} else {
			if ( bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling && bodyState != ePlayerBodyState.Climbing && bodyState != ePlayerBodyState.Crouching ) {
				bodyState = ePlayerBodyState.Idle;
			}
			
		}
		
		// Direction
		if ( controlMode == ePlayerControlMode.ThirdPerson ) {
			if ( isRotationLocked ) {
				UpdateThirdPerson ();

			} else {
				UpdateThirdPerson ( lockedRotationVector );
			}
		
		} else {
			this.GetComponent.<FirstPersonController>().UpdateFirstPerson ( deltaHorizontal, deltaVertical );
		}
			
		
		// ^ Combined delta
		if ( Mathf.Abs ( deltaVertical ) > Mathf.Abs ( deltaHorizontal ) ) {
			deltaCombined = Mathf.Abs ( deltaVertical );
		} else {
			deltaCombined = Mathf.Abs ( deltaHorizontal );
		}
		
		// Set capsule size
		if ( bodyState == ePlayerBodyState.Crouching ) {
			character.height = 0.9;
			character.center = new Vector3 ( 0, 0.45, 0 );
		
		} else {
			character.height = 1.7;
			character.center = new Vector3 ( 0, 0.85, 0 );
		
		}
		
		if ( isGrounded && ( bodyState == ePlayerBodyState.Falling || bodyState == ePlayerBodyState.Jumping ) && bodyState != ePlayerBodyState.Crouching ) {
			bodyState = ePlayerBodyState.Idle;
			
		}
	
		if ( isGrounded ) {
			if ( deltaCombined > 0.5 ) {
				SFXManager.GetInstance().Play ( "sfx_actor_footsteps_run_1", this.audio, true );

			} else if ( deltaCombined > 0.1 && bodyState != ePlayerBodyState.Crouching ) {
				SFXManager.GetInstance().Play ( "sfx_actor_footsteps_walk_1", this.audio, true );

			} else {
				SFXManager.GetInstance().Stop ( [ "sfx_actor_footsteps_walk_1", "sfx_actor_footsteps_run_1" ], this.audio );
			
			}

		} else {
			SFXManager.GetInstance().Stop ( [ "sfx_actor_footsteps_walk_1", "sfx_actor_footsteps_run_1" ], this.audio );

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
