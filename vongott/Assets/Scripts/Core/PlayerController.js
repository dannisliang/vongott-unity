#pragma strict

class PlayerController extends MonoBehaviour {
	enum PlayerState {
		Idle,
		Walking,
		Running,
		Sprinting,
		Jumping,
		Falling
	}
	
	var state : PlayerState = PlayerState.Idle;
	var speed : float = 0.0;
	var jumpVelocity : float = 0.0;
	var jumpApex : float = 0.5;
	var distGround : float = 0.0;
	var isGrounded : boolean = true;

	function Start () {
		var capsule : CapsuleCollider = transform.collider;
		distGround = capsule.height / 2 - capsule.center.y;
	}

	function Update () {
		// Get grounded
		var hit : RaycastHit;
		//isGrounded = Physics.Raycast ( transform.position, -transform.up, distGround + 0.1 );
			
		// Set state
		if ( Input.GetKeyDown ( KeyCode.Space ) && isGrounded ) {
			state = PlayerState.Jumping;
		
		} else if ( Input.GetKey ( KeyCode.LeftShift ) && jumpVelocity == 0 ) {
			state = PlayerState.Running;
			
		} else if ( jumpVelocity == 0 ) {
			state = PlayerState.Walking;
		
		}
		
		// Get input
		var v = Input.GetAxisRaw("Vertical");
		var h = Input.GetAxisRaw("Horizontal");
						
		// Set speed		
		if ( v != 0.0 || h != 0.0 ) {
			// Set rotation
			var camTarget : Transform = CameraTarget.instance;
			var yRotation : float = camTarget.eulerAngles.y;
			
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
									
			transform.rotation = Quaternion.Slerp ( transform.rotation, rotationTarget, 5 * Time.deltaTime );
			
			if ( speed < 0.1 ) { speed = 0.1; }
			
			if ( state == PlayerState.Walking ) {
				if ( speed < 0.25 ) {
					speed += 0.01;
				} else if ( speed > 0.30 ) {
					speed -= 0.01;
				}
				
			} else if ( state == PlayerState.Running ) {
				if ( speed < 1.0 ) {	
					speed += 0.01;
				}
			
			} else if ( state == PlayerState.Jumping ) {
				if ( jumpVelocity < jumpApex ) {
					jumpVelocity += 0.01;
				} else {
					state = PlayerState.Falling;
				}
				
				if ( speed < 0.75 ) {	
					speed += 0.01;
				} else if ( speed > 0.80 ) {
					speed -= 0.01;
				}
			
			} else if ( state == PlayerState.Falling ) { 
				jumpVelocity -= jumpVelocity * 0.01;
				
				if ( speed < 0.75 ) {	
					speed += 0.01;
				} else if ( speed > 0.80 ) {
					speed -= 0.01;
				}
			
			}
							
		} else {
			if ( speed > 0.0 ) {
				speed -= 0.1;
			}
		} 
		
		// Detect end of jump
		if ( isGrounded && state == PlayerState.Falling ) {
			state = PlayerState.Running;
			jumpVelocity = 0.0;
		
		}
		
		this.GetComponent(Animator).SetFloat("Speed", speed );
		this.GetComponent(Animator).SetBool("Jumping", state == PlayerState.Jumping || state == PlayerState.Falling );
	
		transform.position += new Vector3 ( 0, jumpVelocity, 0 );
		
		Debug.Log ( jumpVelocity );
	}
}