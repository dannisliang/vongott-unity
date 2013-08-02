#pragma strict

class PlayerController extends MonoBehaviour {
	enum PlayerState {
		Idle,
		Walking,
		Running,
		Jumping,
		Falling,
		Crouching,
		Creeping,
		SideStepRight,
		SideStepLeft
	}
	
	var state : PlayerState = PlayerState.Idle;
	var speed : float = 0.0;
	var distGround : float = 0.0;
	var isGrounded : boolean = true;
	var inCrawlspace : boolean = false;
	var capsule : CapsuleCollider;
	var crouchMode : boolean = false;

	function Start () {		
		capsule = transform.collider as CapsuleCollider;
		distGround = collider.bounds.extents.y;
	}

	function Update () {
		// Get grounded
		isGrounded = Physics.Raycast ( transform.position, -transform.up, distGround + 0.1 );
		
		// Get crawlspace
		inCrawlspace = Physics.Raycast ( transform.position, transform.up, 1.8, 9 );
								
		// Set state
		if ( !crouchMode && Input.GetKeyDown ( KeyCode.Space ) && state != PlayerState.Jumping && state != PlayerState.Falling ) {
			state = PlayerState.Jumping;
		
		} else if ( !crouchMode && Input.GetKey ( KeyCode.LeftShift ) && state != PlayerState.Jumping && state != PlayerState.Falling ) {
			state = PlayerState.Running;
			
		} else if ( !inCrawlspace && Input.GetKeyDown ( KeyCode.C ) ) {
			crouchMode = !crouchMode;
		
		} else  {
			state = PlayerState.Walking;
		
		}
		
		// Get camera target rotation
		var camTarget : Transform = CameraTarget.instance;
		var yRotation : float = camTarget.eulerAngles.y;
		
		// Get input
		var v = Input.GetAxisRaw("Vertical");
		var h = Input.GetAxisRaw("Horizontal");
		
		// Bullet time!
		if ( Input.GetKeyDown ( KeyCode.LeftControl ) ) {
			if ( GameCore.GetInstance().timeScale == 0.1 ) {
				GameCore.GetInstance().timeScale = 1.0;
			} else {
				GameCore.GetInstance().timeScale = 0.1;
				
				GameCore.Print ( "Player | Bullet Time!" ); 
			}
		}
		
		// Mouse controls
		if ( Input.GetMouseButton(1) && ( state == PlayerState.Idle || state == PlayerState.Walking ) ) {
			transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.Euler ( transform.eulerAngles.x, yRotation, transform.eulerAngles.z ), 10 * Time.deltaTime );
		
			if ( this.GetComponent(Player).equippedItem ) {
				// Set crosshair
				if ( !UIHUD.crosshair.activeSelf ) { UIHUD.ToggleCrosshair (); }
				
				// Raycast
				var here : Vector3 = this.GetComponent(Player).equippedItem.transform.position;
				var there : Vector3 = Camera.main.transform.position + Camera.main.transform.forward * this.GetComponent(Player).GetEquipmentAttribute( Item.Attributes.FireRange );
				var hit : RaycastHit;
				var target : Vector3;
																			
				if ( Physics.Linecast ( Camera.main.transform.position, there, hit ) ) {					
					target = hit.point;
					Debug.DrawLine ( here, target, Color.green );
				} else {
					target = there;
					Debug.DrawLine ( here, target, Color.red );
				}
			
				// Shoot
				if ( Input.GetMouseButton(0) ) {
					this.GetComponent(Player).Shoot ( target );
				}
			}
		
		} else if ( UIHUD.crosshair.activeSelf ) {
			UIHUD.crosshair.SetActive ( false );
		}
														
		// Set speed		
		if ( v != 0.0 || h != 0.0 ) {
			
			// right forward
			if ( h == 1 && v == 1 ) {
				yRotation += 45;
			
			// left forward
			} else if ( h == -1 && v == 1 ) {
				yRotation -= 45;
			
			// left back
			} else if ( h == -1 && v == -1 ) {
				yRotation -= 135;
			
			// right back
			} else if ( h == 1 && v == -1 ) {
				yRotation += 135;
			
			// left
			} else if ( h == -1 && v == 0 ) {
				yRotation -= 90;
			
			// right
			} else if ( h == 1 && v == 0 ) {
				yRotation += 90;
			
			// back
			} else if ( v == -1 && h == 0 ) {
				yRotation += 180;
			
			}
			
			var rotationTarget : Quaternion = Quaternion.Euler ( transform.eulerAngles.x, yRotation, transform.eulerAngles.z );	
			
			if ( !Input.GetMouseButton(1) ) {
				transform.rotation = Quaternion.Slerp ( transform.rotation, rotationTarget, 5 * Time.deltaTime );
			} else {
				if ( h < 0 ) {
					state = PlayerState.SideStepLeft;
				} else if ( h > 0 ) {
					state = PlayerState.SideStepRight;
				}
			}
			
			if ( speed < 0.1 ) { speed = 0.1; }
			
			if ( state == PlayerState.Creeping ) {
				if ( speed < 0.25 ) {	
					speed += 0.01;
				} else if ( speed > 0.30 ) {
					speed -= 0.02;
				}
							
			} else if ( state == PlayerState.Walking ) {
				if ( speed < 0.25 ) {	
					speed += 0.01;
				} else if ( speed > 0.30 ) {
					speed -= 0.02;
				}
				
			} else if ( state == PlayerState.Running ) {
				if ( speed < 1.0 ) {	
					speed += 0.01;
				}
			
			} else if ( state == PlayerState.Jumping ) {
				if ( speed < 0.75 ) {	
					speed += 0.01;
				} else if ( speed > 0.80 ) {
					speed -= 0.02;
				}
			
			} else if ( state == PlayerState.Falling ) { 
				if ( speed > 0.15 ) {
					speed -= 0.01;
				}
			
			}
					
		} else {
			if ( state != PlayerState.Jumping ) { state = PlayerState.Idle; }
			
			if ( speed > 0.0 ) {
				speed -= 0.02;
			}
		
		}
		
		if ( crouchMode ) {
			if ( speed > 0 ) {
				state = PlayerState.Creeping;
			} else {	
				state = PlayerState.Crouching;
			}
		}
		
		// Set capsule size
		if ( state == PlayerState.Creeping || state == PlayerState.Crouching ) {
			capsule.height = 1.0;
			capsule.center = new Vector3 ( 0, 0.5, 0 );
		} else {
			capsule.height = 1.7;
			capsule.center = new Vector3 ( 0, 0.85, 0 );
		}
		
		// Detect end of jump
		if ( isGrounded && ( state == PlayerState.Jumping || state == PlayerState.Falling ) ) {
			state = PlayerState.Running;
		
		}
		
		this.GetComponent(Animator).SetFloat("Speed", speed );
		
		this.GetComponent(Animator).SetBool("Jumping", state == PlayerState.Jumping || state == PlayerState.Falling );
		this.GetComponent(Animator).SetBool("Crouching", state == PlayerState.Crouching );
		this.GetComponent(Animator).SetBool("Creeping", state == PlayerState.Creeping );
		this.GetComponent(Animator).SetBool("SideStepLeft", state == PlayerState.SideStepLeft );
		this.GetComponent(Animator).SetBool("SideStepRight", state == PlayerState.SideStepRight );

	}

	function FixedUpdate () {

	}
}