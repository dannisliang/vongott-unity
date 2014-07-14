#pragma strict

public class MotionController extends MonoBehaviour {
	public var useRootMotion : boolean = false;
	public var useCameraRotation : boolean = true;
	public var walkSpeed = 6.0;
	public var runSpeed = 11.0;
	public var modifier : Vector2 = new Vector2 ( 1, 1 );

	// If true, diagonal speed (when strafing + moving forward or back) can't exceed normal move speed; otherwise it's about 1.4 times faster
	public var limitDiagonalSpeed = true;
	 
	// If checked, the run key toggles between running and walking. Otherwise player runs if the key is held down and walks otherwise
	// There must be a button set up in the Input Manager called "Run"
	public var toggleRun = false;
	 
	public var jumpSpeed = 8.0;
	public var gravity = 20.0;
	 
	// Units that player can fall before a falling damage function is run. To disable, type "infinity" in the inspector
	public var fallingDamageThreshold = 10.0;
	 
	// If the player ends up on a slope which is at least the Slope Limit as set on the character controller, then he will slide down
	public var slideWhenOverSlopeLimit = false;
	 
	// If checked and the player is on an object tagged "Slide", he will slide down it regardless of the slope limit
	public var slideOnTaggedObjects = false;
	 
	public var slideSpeed = 12.0;
	 
	// If checked, then the player can change direction while in the air
	public var airControl = false;
	 
	// Small amounts of this results in bumping when walking down slopes, but large amounts results in falling too fast
	public var antiBumpFactor = .75;
	 
	// Player must be grounded for at least this many physics frames before being able to jump again; set to 0 to allow bunny hopping 
	public var antiBunnyHopFactor = 1;
	 
	private var moveDirection = Vector3.zero;
	private var grounded = false;
	private var controller : CharacterController;
	private var myTransform : Transform;
	private var speed : float;
	private var hit : RaycastHit;
	private var fallStartLevel : float;
	private var falling = false;
	private var slideLimit : float;
	private var rayDistance : float;
	private var contactPoint : Vector3;
	private var playerControl = false;
	private var jumpTimer : int;
	private var oldPos : Vector3;

	public function Start () {
		controller = GetComponent(CharacterController);
		myTransform = transform;
		speed = walkSpeed;
		rayDistance = controller.height * .5 + controller.radius;
		slideLimit = controller.slopeLimit - .1;
		jumpTimer = antiBunnyHopFactor;
		oldPos = transform.position;
	}
	 
	public function UpdateController ( inputX : float, inputY : float ) {
		var inputCombined : float = 0;

		if ( Mathf.Abs ( inputX ) > Mathf.Abs ( inputY ) ) {
			inputCombined = Mathf.Abs ( inputX );
		
		} else {
			inputCombined = Mathf.Abs ( inputY );

		}
		
		if ( !myTransform ) {
			myTransform = transform;
		}

		if ( useCameraRotation ) {
			transform.rotation = Quaternion.Euler ( 0, Camera.main.transform.eulerAngles.y, 0 );
		
		} else if ( inputX != 0 || inputY != 0 ) {
			var targetRotation : float = Camera.main.transform.eulerAngles.y;
			var angle = Mathf.Atan2 ( inputY, -inputX ) * Mathf.Rad2Deg;
			targetRotation += angle - 90;

			var rotationQuaternion : Quaternion = Quaternion.Euler ( 0, targetRotation, 0 );
				
			transform.rotation = Quaternion.Slerp ( transform.rotation, rotationQuaternion, Time.deltaTime * 5 );

		}

		// If both horizontal and vertical are used simultaneously, limit speed (if allowed), so the total doesn't exceed normal move speed
		var inputModifyFactor = (inputX != 0.0 && inputY != 0.0 && limitDiagonalSpeed)? .7071 : 1.0;
	 
		if (grounded) {
			var sliding = false;
			// See if surface immediately below should be slid down. We use this normally rather than a ControllerColliderHit point,
			// because that interferes with step climbing amongst other annoyances
			if (Physics.Raycast(myTransform.position, -Vector3.up, hit, rayDistance)) {
				if (Vector3.Angle(hit.normal, Vector3.up) > slideLimit)
					sliding = true;
			}
			// However, just raycasting straight down from the center can fail when on steep slopes
			// So if the above raycast didn't catch anything, raycast down from the stored ControllerColliderHit point instead
			else {
				Physics.Raycast(contactPoint + Vector3.up, -Vector3.up, hit);
				if (Vector3.Angle(hit.normal, Vector3.up) > slideLimit)
					sliding = true;
			}
	 
			// If we were falling, and we fell a vertical distance greater than the threshold, run a falling damage routine
			if (falling) {
				falling = false;
				if (myTransform.position.y < fallStartLevel - fallingDamageThreshold)
					FallingDamageAlert (fallStartLevel - myTransform.position.y);
			}
	 
			// If running isn't on a toggle, then use the appropriate speed depending on whether the run button is down
			if (!toggleRun) 
				speed = Input.GetButton ( "Run" ) ? runSpeed : walkSpeed;
	 
			// If sliding (and it's allowed), or if we're on an object tagged "Slide", get a vector pointing down the slope we're on
			if ( (sliding && slideWhenOverSlopeLimit) || (slideOnTaggedObjects && hit.collider.tag == "Slide") ) {
				var hitNormal = hit.normal;
				moveDirection = Vector3(hitNormal.x, -hitNormal.y, hitNormal.z);
				Vector3.OrthoNormalize (hitNormal, moveDirection);
				moveDirection *= slideSpeed;
				playerControl = false;
			}
			// Otherwise recalculate moveDirection directly from axes, adding a bit of -y to avoid bumping down inclines
			else {
				moveDirection = Vector3(inputX * inputModifyFactor * modifier.x, -antiBumpFactor, inputY * inputModifyFactor * modifier.y);
				moveDirection = myTransform.TransformDirection(moveDirection) * speed;
				playerControl = true;
			}
	 
			// Jump! But only if the jump button has been released and player has been grounded for a given number of frames
			if (!Input.GetButtonDown("Jump"))
				jumpTimer++;
			else if (jumpTimer >= antiBunnyHopFactor) {
				moveDirection.y = jumpSpeed;
				jumpTimer = 0;
			}
		}
		else {
			// If we stepped over a cliff or something, set the height at which we started falling
			if (!falling) {
				falling = true;
				fallStartLevel = myTransform.position.y;
			}
	 
			// If air control is allowed, check movement but don't touch the y component
			if (airControl && playerControl) {
				moveDirection.x = inputX * speed * inputModifyFactor * modifier.x;
				moveDirection.z = inputY * speed * inputModifyFactor * modifier.y;
				moveDirection = myTransform.TransformDirection(moveDirection);
			}
		}
	 
		// Apply gravity
		moveDirection.y -= gravity * Time.deltaTime;
	
		if ( useRootMotion && grounded ) {
			moveDirection.x = 0;
			moveDirection.z = 0;
		}

		// Move the controller, and set grounded true or false depending on whether we're standing on something
		grounded = (controller.Move(moveDirection * Time.deltaTime) & CollisionFlags.Below) != 0;
	}
	 
	// Store point that we're in contact with for use in FixedUpdate if needed
	public function OnControllerColliderHit (hit : ControllerColliderHit) {
		contactPoint = hit.point;
	}
	 
	// If falling damage occured, this is the place to do something about it. You can make the player
	// have hitpoints and remove some of them based on the distance fallen, add sound effects, etc.
	public function FallingDamageAlert (fallDistance : float) {
		Debug.Log ("Ouch! Fell " + fallDistance + " units!");	
	}
}
