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
	private var player : Player;
	private var character : CharacterController;
	private var ladder : Ladder;
	private var lerping : boolean = false;
	private var lerpGoal : Vector3;

	public function SetControlMode ( mode : ePlayerControlMode ) {
		controlMode = mode;
	}

	public function SetLadder ( ladder : Ladder ) {
		if ( ladder != null ) {
			GameCore.GetPlayer().HolsterItem();
		} else {
			GameCore.GetPlayer().UnholsterItem();
		}

		this.ladder = ladder;

		var newPos : Vector3 = ladder.initPos;
		newPos.y = player.transform.position.y;
		player.transform.position = newPos;

	}

	public function Start () {
		distToGround = collider.bounds.extents.y;
		character = this.GetComponent.<CharacterController>();
	}
	
	public function UpdateThirdPerson () {
		if ( isRotationLocked ) {
			player.transform.rotation = Quaternion.Euler ( lockedRotationVector );
		
		} else {
			if ( deltaVertical != 0 || deltaHorizontal != 0 ) {
				var targetRotation : float = Camera.main.transform.eulerAngles.y;
				var angle = Mathf.Atan2 ( deltaVertical, -deltaHorizontal ) * Mathf.Rad2Deg;
				targetRotation += angle - 90;

				var rotationQuaternion : Quaternion = Quaternion.Euler ( 0, targetRotation, 0 );
					
				player.transform.rotation = Quaternion.Slerp ( player.transform.rotation, rotationQuaternion, 5 * Time.deltaTime );
			}
		}
	}

	public function Update () {
		if ( !GameCore.GetInstance().GetControlsActive() ) {
			return;
		}
		
		if ( !player ) {
			player = this.GetComponent(Player);
		}
	
		if ( player.stats.hp <= 0 ) { 
			return;
		}

		if ( lerping ) {
			transform.position = Vector3.Lerp ( transform.position, lerpGoal, Time.deltaTime * 2 );

			if ( Vector3.Distance ( transform.position, lerpGoal ) < 0.1 ) {
				lerping = false;
			}

			return;
		}

		isClimbing = ladder != null;	
		isGrounded = Physics.Raycast(transform.position, -Vector3.up, distToGround + 0.1); 
		inCrawlspace = bodyState == ePlayerBodyState.Crouching && Physics.Raycast ( player.transform.position, player.transform.up, 1.8, 9 );
		
		// Climbing
		if ( isClimbing ) {
			bodyState = ePlayerBodyState.Climbing;
		
			isRotationLocked = true;
			lockedRotationVector = ladder.transform.eulerAngles;

		} else {
			isRotationLocked = false;

		}

		// Jumping
		if ( Input.GetKeyDown ( KeyCode.Space ) && bodyState != ePlayerBodyState.Crouching && bodyState != ePlayerBodyState.Jumping && bodyState != ePlayerBodyState.Falling ) {
			if ( isClimbing ) {
				ladder = null;
				bodyState = ePlayerBodyState.Falling;

			} else if ( isGrounded ) {
				bodyState = ePlayerBodyState.Jumping;

				SFXManager.GetInstance().Play ( "jump_" + Random.Range ( 1, 3 ), this.audio );
			}

			if ( InputManager.jumpFunction ) {
				InputManager.jumpFunction ();
				InputManager.jumpFunction = null;
			}

		// Crouching
		} else if ( Input.GetKeyDown ( KeyCode.LeftControl ) && !isClimbing ) {
			if ( bodyState == ePlayerBodyState.Crouching && !inCrawlspace ) {
				bodyState = ePlayerBodyState.Idle;

				SFXManager.GetInstance().Play ( "crouch_up_1", this.audio );
			
			} else {
				bodyState = ePlayerBodyState.Crouching;
				
				SFXManager.GetInstance().Play ( "crouch_down_1", this.audio );
			
			}
	
		}
				
		// Shoot
		if ( Input.GetMouseButton ( 0 ) && !isClimbing ) {
			actionState = ePlayerActionState.Shooting;
		
		// Interact
		} else if ( Input.GetMouseButtonDown ( 1 ) ) {
			if ( GameCore.GetInteractiveObject() ) {
				actionState = ePlayerActionState.Interacting;
				GameCore.GetInteractiveObject().Interact();
			}
			
		// Idle
		} else if ( !isClimbing ) {
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
			if ( ladder && isClimbing ) {
				if ( player.collider.bounds.max.y >= ladder.collider.bounds.max.y ) {
					if ( ladder.blockedTop ) {
						deltaVertical = 0;
					
					} else {
						deltaVertical = 0;

						player.transform.position = ladder.topPosition;

						if ( ladder.endsInCrawlspace ) {
							bodyState = ePlayerBodyState.Crouching;
							player.animator.SetBool ( "Crouching", true );
						}

						player.animator.SetTrigger ( "ClimbingUp" );
						
						ladder = null;
						isClimbing = false;

					}
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
			UpdateThirdPerson ();
		
		} else {
			if ( isClimbing ) {
				transform.localPosition.y += deltaVertical * 0.01;	

			} else {
				this.GetComponent.<FirstPersonController>().UpdateFirstPerson ( deltaHorizontal, deltaVertical );
			
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
			character.height = 0.8;
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
				SFXManager.GetInstance().Play ( "footsteps_run_1", this.audio, true );

			} else if ( deltaCombined > 0.1 && bodyState != ePlayerBodyState.Crouching ) {
				SFXManager.GetInstance().Play ( "footsteps_walk_1", this.audio, true );

			} else {
				SFXManager.GetInstance().Stop ( [ "footsteps_walk_1", "footsteps_run_1" ], this.audio );
			
			}

		} else {
			SFXManager.GetInstance().Stop ( [ "footsteps_walk_1", "footsteps_run_1" ], this.audio );

		}
		
		player.animator.SetFloat ( "DeltaVertical", deltaVertical );
		player.animator.SetFloat ( "DeltaHorizontal", deltaHorizontal );
		player.animator.SetFloat ( "DeltaCombined", deltaCombined );

		player.animator.SetBool ( "Jumping", bodyState == ePlayerBodyState.Jumping || bodyState == ePlayerBodyState.Falling );
		player.animator.SetBool ( "Crouching", bodyState == ePlayerBodyState.Crouching );
		player.animator.SetBool ( "Climbing", bodyState == ePlayerBodyState.Climbing );
		player.animator.SetBool ( "Shooting", actionState == ePlayerActionState.Shooting );
		player.animator.SetBool ( "Interacting", actionState == ePlayerActionState.Interacting );
		player.animator.SetBool ( "FirstPerson", controlMode == ePlayerControlMode.FirstPerson );

	}
}
