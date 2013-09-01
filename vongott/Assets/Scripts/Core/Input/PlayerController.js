#pragma strict

class PlayerController extends MonoBehaviour {
	enum PlayerState {
		Idle,
		Jumping,
		Falling,
		Crouching,
		Aiming
	}
	
	var state : PlayerState = PlayerState.Idle;
	var speed : float = 0.0;
	var acceleration : float = 3.0;
	var runningSpeed : float = 5.0;
	var speedModifier : float = 1.0;
	var distGround : float = 0.0;
	var isGrounded : boolean = true;
	var inCrawlspace : boolean = false;
	var capsule : CapsuleCollider;
	var crouchMode : boolean = false;
	var aimMode : boolean = false;
	var sideStep : float;

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
			
		} else if ( !inCrawlspace && Input.GetKeyDown ( KeyCode.C ) ) {
			crouchMode = !crouchMode;
		
		}
		
		// Get camera target rotation
		var camTarget : Transform = CameraTarget.instance;
		var yRotation : float = camTarget.eulerAngles.y;
		
		// Get input
		var v = Input.GetAxisRaw("Vertical");
		var h = Input.GetAxisRaw("Horizontal");
		
		// Mouse controls
		aimMode = false;
		
		if ( Input.GetMouseButton(1) ) {
			transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.Euler ( transform.eulerAngles.x, yRotation, transform.eulerAngles.z ), 10 * Time.deltaTime );
		
			aimMode = true;
		
			if ( this.GetComponent(Player).equippedItem ) {
				// Set crosshair
				if ( !UIHUD.crosshair.activeSelf ) { UIHUD.ToggleCrosshair (); }
				
				// Raycast
				var here : Vector3 = this.GetComponent(Player).equippedItem.transform.position;
				var there : Vector3 = Camera.main.transform.position + Camera.main.transform.forward * this.GetComponent(Player).GetEquipmentAttribute( Item.eItemAttribute.FireRange );
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
				transform.rotation = Quaternion.Slerp ( transform.rotation, rotationTarget, ( 5 * speedModifier ) * Time.deltaTime );
			} else {
				sideStep = h;
			}
			
			var targetSpeed : float = 0.1;
			
			if ( speed < targetSpeed ) { speed = targetSpeed; }
			
			if ( !crouchMode && !aimMode && Input.GetKey ( KeyCode.LeftShift ) ) {
				targetSpeed = speedModifier;
			
			} else if ( state == PlayerState.Jumping ) {
				targetSpeed = speedModifier;
			
			} else if ( state == PlayerState.Falling ) { 
				targetSpeed = 0.15;
			
			} else {
				targetSpeed = 0.25;
			
			}
			
			speed = Mathf.Lerp ( speed, targetSpeed, acceleration * Time.deltaTime );		
					
		} else {
			if ( state != PlayerState.Jumping ) { state = PlayerState.Idle; }
			
			if ( speed > 0.0 ) {
				speed -= 0.02;
			}
		
		}
		
		if ( crouchMode ) {
			state = PlayerState.Crouching;
		}
		
		if ( aimMode ) {
			state = PlayerState.Aiming;
		}
		
		// Set capsule size
		if ( state == PlayerState.Crouching ) {
			capsule.height = 1.0;
			capsule.center = new Vector3 ( 0, 0.5, 0 );
		} else {
			capsule.height = 1.7;
			capsule.center = new Vector3 ( 0, 0.85, 0 );
		}
		
		// Detect end of jump
		if ( isGrounded && ( state == PlayerState.Jumping || state == PlayerState.Falling ) ) {
			state = PlayerState.Idle;
		
		}
		
		this.transform.position = this.transform.position + this.transform.forward * ( speed * runningSpeed * Time.deltaTime );
		
		this.GetComponent(Animator).SetFloat("Speed", speed * ( 1 + Time.deltaTime ) );
		
		this.GetComponent(Animator).SetBool("Jumping", state == PlayerState.Jumping || state == PlayerState.Falling );
		this.GetComponent(Animator).SetBool("Crouching", state == PlayerState.Crouching );
		this.GetComponent(Animator).SetBool("Aiming", state == PlayerState.Aiming );
	}
}