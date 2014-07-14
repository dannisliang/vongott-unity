#pragma strict

public enum ePlayerControlMode {
	ThirdPerson,
	FirstPerson
}

public class PlayerController extends MonoBehaviour {
	public var controlMode : ePlayerControlMode = ePlayerControlMode.ThirdPerson;
	
	public var deltaVertical : float;
	public var deltaHorizontal : float;
	public var deltaCombined : float;

	public var isDisabled : boolean = false;
	public var inCrawlspace : boolean = false;
	public var isGrounded : boolean = false;
	public var isShooting : boolean = false;
	public var isFalling : boolean = false;
	public var isJumping : boolean = false;
	public var isCrouching : boolean = false;
	public var isRotationLocked : boolean = false;
	public var useForcedPoint : boolean = false;
	
	private var distToGround : float = float.PositiveInfinity;
	private var forcedPointVector : Vector3;
	private var lockedRotationVector : Vector3;
	private var player : Player;
	private var character : CharacterController;
	private var ladderObject : Ladder;
	private var canUseLadder : boolean = true;

	public function SetControlMode ( mode : ePlayerControlMode ) {
		controlMode = mode;
	}

	public function get ladder () : Ladder {
		return ladderObject;
	}

	public function set ladder ( value : Ladder ) {
		if ( value ) {
			if ( value == ladderObject ) { return; }
			
			var direction : Vector3 = value.transform.position - this.transform.position;
			
			if ( canUseLadder && ( Vector3.Angle ( direction, this.transform.forward ) ) < 90 ) {
				player.HolsterItem();
				ladderObject = value;
				
				if ( Vector3.Distance ( this.transform.position, ladder.endPos ) < 1 ) {
					var startPos : Vector3 = ladder.transform.position;
					startPos.y = ladder.topY - 2;
					startPos -= ladder.transform.forward * 0.5;
						
					StartCoroutine ( function () : IEnumerator {
						isDisabled = true;
						canUseLadder = false;
						iTween.MoveTo ( this.gameObject, iTween.Hash ( "position", startPos, "time", 0.7, "easetype", iTween.EaseType.linear ) );
						yield WaitForSeconds ( 0.8 );
						isDisabled = false;
						canUseLadder = true;
					} () );

				}
				
				player.animator.SetTrigger ( "ClimbingBegin" );
			}
		
		} else if ( ladder ) {
			player.UnholsterItem ();
			ladderObject = null;

		}
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
			player = this.GetComponent.< Player > ();
		}
	
		if ( player.stats.hp <= 0 ) { 
			return;
		}

		// Set flags
		isGrounded = Physics.Raycast ( transform.position, -Vector3.up, distToGround + 0.1 ); 
		inCrawlspace = isCrouching && Physics.Raycast ( player.transform.position, player.transform.up, 1.8, 9 );
		
		// ^ Climbing
		if ( ladder ) {
			isRotationLocked = true;
			lockedRotationVector = ladder.transform.eulerAngles;

		} else {
			isRotationLocked = false;

		}

		// ^ Jumping
		if ( Input.GetKeyDown ( KeyCode.Space ) && !isCrouching && !isJumping && !isFalling ) {
			if ( ladder ) {
				var ladderDirection : Vector3 = ladder.transform.position - this.transform.position;
				var lookDirection : Vector3 = Camera.main.transform.forward;
				lookDirection.y = 0;

				if ( Vector3.Angle ( ladderDirection, lookDirection ) > 90 ) {
					ladder = null;
					canUseLadder = false;
					isFalling = true;
				}

			} else if ( isGrounded ) {
				isJumping = true;
				player.animator.SetTrigger ( "JumpingBegin" );

				SFXManager.GetInstance().Play ( "jump_" + Random.Range ( 1, 3 ), this.audio );
			}

		// ^ Crouching
		} else if ( Input.GetKeyDown ( KeyCode.LeftControl ) && !ladder ) {
			if ( isCrouching && !inCrawlspace ) {
				isCrouching = false;
				
				SFXManager.GetInstance().Play ( "crouch_up_1", this.audio );
			
			} else {
				isCrouching = true;
				
				SFXManager.GetInstance().Play ( "crouch_down_1", this.audio );
			
			}
	
		}
				
		// ^ Shoot
		isShooting = Input.GetMouseButtonDown ( 0 ) && ladder == null;

		// Interact
		if ( !isShooting && Input.GetMouseButtonDown ( 1 ) ) {
			if ( GameCore.GetInteractiveObject() ) {
				GameCore.GetInteractiveObject().Interact();
			}
		}
		
		// Locomotion
		deltaVertical = Input.GetAxisRaw ( "Vertical" );
		deltaHorizontal = Input.GetAxisRaw ( "Horizontal" );
		deltaCombined = 0.0;
	
		// ^ Forced point
		if ( useForcedPoint ) {
			player.transform.position = forcedPointVector;
			useForcedPoint = false;
		}

		// ^ Deltas
		if ( !isDisabled && ( deltaVertical != 0.0 || deltaHorizontal != 0.0 ) ) {
			// Climbing
			if ( ladder ) {
				if ( player.transform.position.y >= ladder.topY - 2 && deltaVertical > 0.1 ) {
					deltaVertical = 0;
					deltaHorizontal = 0;

					if ( !ladder.blockedTop ) {
						if ( ladder.endsInCrawlspace ) {
							isCrouching = true;
						}

						player.animator.SetTrigger ( "ClimbingEnd" );

						StartCoroutine ( function () : IEnumerator {	
							isDisabled = true;
							canUseLadder = false;
							iTween.MoveTo ( this.gameObject, iTween.Hash ( "position", ladder.endPos, "time", 0.7, "easetype", iTween.EaseType.linear ) );
							yield WaitForSeconds ( 0.8 );
							ladder = null;
							isDisabled = false;
							canUseLadder = true;
						} () );

					}
			
				} else if ( player.transform.position.y <= ladder.transform.position.y + 0.25 && deltaVertical < -0.1 ) {
					ladder = null;
					
					StartCoroutine ( function () : IEnumerator {
						canUseLadder = false;
						yield WaitForSeconds ( 1 );
						canUseLadder = true;
					} () );

				} else {
					var ladderPos : Vector3 = ladder.transform.position - ladder.transform.forward * 0.5;
					ladderPos.y = this.transform.position.y;

					this.transform.position = ladderPos;
					this.transform.rotation = ladder.transform.rotation;
				
				}

			// Sprint
			} else if ( Input.GetKey ( KeyCode.LeftShift ) && !isCrouching && !isJumping && !isFalling ) {
			
			// Walk
			} else {				
				deltaVertical = Mathf.Clamp ( deltaVertical, -0.3, 0.3 );
				deltaHorizontal = Mathf.Clamp ( deltaHorizontal, -0.3, 0.3 );
			
			}
			
		}
		
		// Update correct controller script
		if ( controlMode == ePlayerControlMode.ThirdPerson || ladder != null ) {
			UpdateThirdPerson ();
		
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
		if ( isCrouching ) {
			character.height = 0.8;
			character.center = new Vector3 ( 0, 0.45, 0 );
		
		} else {
			character.height = 1.7;
			character.center = new Vector3 ( 0, 0.85, 0 );
		
		}
		
		// Sounds and overridden flags
		if ( isGrounded ) {
			if ( deltaCombined > 0.5 ) {
				SFXManager.GetInstance().Play ( "footsteps_run_1", this.audio, true );

			} else if ( deltaCombined > 0.1 && !isCrouching ) {
				SFXManager.GetInstance().Play ( "footsteps_walk_1", this.audio, true );

			} else {
				SFXManager.GetInstance().Stop ( [ "footsteps_walk_1", "footsteps_run_1" ], this.audio );
			
			}

			canUseLadder = true;
			isFalling = false;
			isJumping = false;

		} else {
			SFXManager.GetInstance().Stop ( [ "footsteps_walk_1", "footsteps_run_1" ], this.audio );

			if ( !isJumping && ladder == null ) {
				isFalling = true;
			} else {
				isFalling = false;
			}
		}
	
		// Set animator values	
		player.animator.SetFloat ( "DeltaVertical", deltaVertical );
		player.animator.SetFloat ( "DeltaHorizontal", deltaHorizontal );
		player.animator.SetFloat ( "DeltaCombined", deltaCombined );

		player.animator.SetBool ( "Jumping", isJumping || isFalling );
		player.animator.SetBool ( "Crouching", isCrouching );
		player.animator.SetBool ( "Climbing", ladder != null );
		player.animator.SetBool ( "Shooting", isShooting );
		player.animator.SetBool ( "FirstPerson", controlMode == ePlayerControlMode.FirstPerson );

		if ( player.IsEquippedCategory ( "Weapon" ) && ladder == null ) {
			player.animator.SetBool ( "Aiming", true );
			player.animator.SetLayerWeight ( 1, 1 );
		
		} else {
			player.animator.SetBool ( "Aiming", false );
			player.animator.SetLayerWeight ( 1, 0 );
	
		}

	}
}
