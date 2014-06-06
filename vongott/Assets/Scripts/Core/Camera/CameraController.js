#pragma strict

enum eCameraState {
	None,
	ThirdPerson,
	FirstPerson,
	CutScene
}

public class CameraController extends MonoBehaviour {
	public var state : eCameraState = eCameraState.ThirdPerson;
	public var storedPreference : eCameraState;
	public var target : GameObject;                   // Target to follow
	public var distance : float = 5;                 // Default Distance
	public var standingOffset : Vector2 = new Vector2 ( 0.4, 1.6 );
	public var crouchedOffset : Vector2 = new Vector2 ( 0.4, 0.8 );
	public var crawlspaceOffset : Vector2 = new Vector2 ( 0.4, 0.7 );
	public var offsetFromWall : float = 0.1;          // Bring camera away from any colliding objects
	public var maxDistance : float = 1.4;               // Maximum zoom Distance
	public var minDistance : float = 0.6;             // Minimum zoom Distance
	public var xSpeed : float = 200;                  // Orbit speed (Left/Right)
	public var ySpeed : float = 200;                  // Orbit speed (Up/Down)
	public var yMinLimit : float = -80;               // Looking up limit
	public var yMaxLimit : float = 80;                // Looking down limit
	public var zoomRate : float = 40;                 // Zoom Speed
	public var rotationDampening : float = 3;         // Auto Rotation speed (higher = faster)
	public var zoomDampening : float = 5;             // Auto Zoom speed (Higher = faster)
	public var collisionLayers : LayerMask = -1;      // What the camera will collide with
	public var lockToRearOfTarget : boolean = false;  // Lock camera to rear of target
	public var allowMouseInputX : boolean = true;     // Allow player to control camera angle on the X axis (Left/Right)
	public var allowMouseInputY : boolean = true;     // Allow player to control camera angle on the Y axis (Up/Down)
	public var shakeOffset : Vector3;

	private var targetOffset : Vector2;	          // Vertical offset adjustment
	private var xDeg : float = 0;                     // Temp var
	private var yDeg : float = 0;                     // Temp var
	private var currentDistance : float;              // Temp var
	private var desiredDistance : float;              // Temp var
	private var correctedDistance : float;            // Temp var
	private var rotateBehind : boolean = false;       // Temp var
	private var pbuffer : float = 0;                  // Cooldown buffer for SideButtons
	private var coolDown : float = 0.5;               // Cooldowntime for SideButtons
	private var locked : boolean = false;
	private var player : Player;
	private var initCorrection : float = 2;

	private function RotateBehindTarget () {
		var targetRotationAngle : float = target.transform.eulerAngles.y;
		var currentRotationAngle : float = transform.eulerAngles.y;
		xDeg = Mathf.LerpAngle ( currentRotationAngle, targetRotationAngle, rotationDampening * Time.deltaTime );

		// Stop rotating behind if not completed
		if ( targetRotationAngle == currentRotationAngle ) {
			if ( !lockToRearOfTarget ) {
				rotateBehind = false;
			}
		
		} else {
			rotateBehind = true;
		
		}
	}

	private function ClampAngle ( angle : float, min : float, max : float ) {
		if ( angle < -360 ) {
			angle += 360;
		
		} else if ( angle > 360 ) {
			angle -= 360;
		
		}

		return Mathf.Clamp ( angle, min, max );
	}

	private function UpdateFirstPerson () {
		// Check to see if mouse input is allowed on the axis
		if ( allowMouseInputX ) {
			xDeg += Input.GetAxis ("Mouse X") * xSpeed * 0.02;
		}
		
		if ( allowMouseInputY ) {
			yDeg -= Input.GetAxis ("Mouse Y") * ySpeed * 0.02;
		}

		yDeg = ClampAngle ( yDeg, yMinLimit, yMaxLimit );
		
		// Exit first person mode
		if ( !locked && Input.GetAxis ("Mouse ScrollWheel") < 0 ) {
			desiredDistance = 0.63;
			currentDistance = 0.63;
			state = eCameraState.ThirdPerson;
			GameCore.GetPlayer().CheckWeaponPosition();
		}

		// Set camera rotation
		var rotation : Quaternion = Quaternion.Euler ( yDeg, xDeg, 0 );
		
		// Set camera position
		var position : Vector3 = target.transform.position + new Vector3 ( 0, targetOffset.y, 0 );
		
		// Apply shake
		position += shakeOffset;
		
		// Finally set rotation and position of camera
		transform.rotation = Quaternion.Slerp ( transform.rotation, rotation, Time.deltaTime * 80 );
		transform.position = position;
	}

	private function UpdateThirdPerson () {
		// Push buffer
		if ( pbuffer > 0 ) {
			pbuffer -=Time.deltaTime;
		}

		if ( pbuffer < 0 ) {
			pbuffer=0;
		}
		   
		// Get correct offset
		var vTargetOffset : Vector3;

		// Check to see if mouse input is allowed on the axis
		if ( allowMouseInputX ) {
			xDeg += Input.GetAxis ("Mouse X") * xSpeed * 0.02;
		
		} else {
			RotateBehindTarget();
		
		}
		
		if ( allowMouseInputY ) {
			yDeg -= Input.GetAxis ("Mouse Y") * ySpeed * 0.02;
		}

		// Interrupt rotating behind if mouse wants to control rotation
		if ( !lockToRearOfTarget ) {
			rotateBehind = false;

		// Otherwise, ease behind the target if any of the directional keys are pressed
		} else if ( initCorrection > 0 || player.controller.deltaCombined > 0 || rotateBehind ) {
			RotateBehindTarget ();
		}
		
		yDeg = ClampAngle ( yDeg, yMinLimit, yMaxLimit );

		// Set camera rotation
		var rotation : Quaternion = Quaternion.Euler ( yDeg, xDeg, 0 );

		// Calculate the desired distance
		desiredDistance -= Input.GetAxis ("Mouse ScrollWheel") * Time.deltaTime * zoomRate * Mathf.Abs (desiredDistance);
		desiredDistance = Mathf.Clamp (desiredDistance, minDistance, maxDistance);
		correctedDistance = desiredDistance;

		// Calculate desired camera position
		vTargetOffset = new Vector3 ( 0, -targetOffset.y, 0 );
		var position : Vector3 = target.transform.position - ( rotation * Vector3.forward * desiredDistance + vTargetOffset );

		// Check for collision using the true target's desired registration point as set by user using height
		var collisionHit : RaycastHit;
		var trueTargetPosition : Vector3 = new Vector3 ( target.transform.position.x, target.transform.position.y + targetOffset.y, target.transform.position.z );

		// If there was a collision, correct the camera position and calculate the corrected distance
		var isCorrected : boolean = false;
		if ( Physics.Linecast (trueTargetPosition, position, collisionHit, collisionLayers) ) {
		    // Calculate the distance from the original estimated position to the collision location,
		    // subtracting out a safety "offset" distance from the object we hit.  The offset will help
		    // keep the camera from being right on top of the surface we hit, which usually shows up as
		    // the surface geometry getting partially clipped by the camera's front clipping plane.
		    correctedDistance = Vector3.Distance ( trueTargetPosition, collisionHit.point ) - offsetFromWall;
		    isCorrected = true;
		}

		// For smoothing, lerp distance only if either distance wasn't corrected, or correctedDistance is more than currentDistance
		currentDistance = !isCorrected || correctedDistance > currentDistance ? Mathf.Lerp (currentDistance, correctedDistance, Time.deltaTime * zoomDampening) : correctedDistance;

		// Keep within limits
		currentDistance = Mathf.Clamp (currentDistance, minDistance, maxDistance);

		// Recalculate position based on the new currentDistance
		position = target.transform.position - (rotation * Vector3.forward * currentDistance + vTargetOffset);

		// Apply horizontal offset
		position += transform.right * targetOffset.x;

		// Apply shake
		position += shakeOffset;

		// Finally set rotation and position of camera
		transform.rotation = rotation;
		transform.position = position;

		// Go to first person mode
		if ( desiredDistance <= 0.6 ) {
			state = eCameraState.FirstPerson;
			GameCore.GetPlayer().CheckWeaponPosition();
		}

		if ( initCorrection > 0 ) {
			initCorrection -= Time.deltaTime;
		}
	}

	function LockFirstPerson () {
		storedPreference = state;
		
		state = eCameraState.FirstPerson;
		GameCore.GetPlayer().CheckWeaponPosition();
		locked = true;
	
		GameCore.Print ( "CameraController | Locked to first person" );
	}

	function Unlock () {
		locked = false;

		if ( storedPreference != eCameraState.None ) {	
			state = storedPreference;
		}
		
		GameCore.GetPlayer().CheckWeaponPosition();

		GameCore.Print ( "CameraController | Unlocked" );

		storedPreference = eCameraState.None;	
	}

	function Start () {      
		var angles : Vector3 = transform.eulerAngles;
		xDeg = angles.x;
		yDeg = angles.y;
		currentDistance = distance;
		desiredDistance = distance;
		correctedDistance = distance;

		// Make the rigid body not change rotation
		if ( rigidbody ) {
			rigidbody.freezeRotation = true;
		}
		   
		if ( lockToRearOfTarget ) {
			rotateBehind = true;
		}
	}

	function LateUpdate () {
		// Don't do anything if target is not defined
		if ( target == null ) {
			target = GameCore.GetPlayerObject ();
			return;
		
		} else if ( !player ) {
			player = target.GetComponent.<Player>();
			return;
		
		} else if ( !player.controller ) {
			player.controller = player.GetComponent.< PlayerController > ();
			return;

		}

		// Only run if not in cutscene mode and controls are enabled
		if ( state == eCameraState.CutScene || !GameCore.GetInstance().GetControlsActive() ) {
			return;
		}

		// Get correct offset
		if ( player.controller.bodyState == ePlayerBodyState.Crouching ) {
			targetOffset = Vector3.Slerp ( targetOffset, crouchedOffset, Time.deltaTime * 10 );

		} else if ( player.controller.inCrawlspace ) {
			targetOffset = Vector3.Slerp ( targetOffset, crawlspaceOffset, Time.deltaTime * 10 );

		} else {
			targetOffset = Vector3.Slerp ( targetOffset, standingOffset, Time.deltaTime * 10 );

		}

		// Update correct mode
		if ( state == eCameraState.ThirdPerson ) {
			UpdateThirdPerson ();
		} else if ( state == eCameraState.FirstPerson ) {
			UpdateFirstPerson ();
		}
		
		// Instant switch
		if ( Input.GetMouseButtonDown ( 2 ) && !locked ) {
			if ( state == eCameraState.ThirdPerson ) {
				state = eCameraState.FirstPerson;

			} else {
				state = eCameraState.ThirdPerson;
			
				if ( currentDistance < 0.63 || desiredDistance < 0.63 ) {
					desiredDistance = 0.63;
					currentDistance = 0.63;
				}
			}
			
			GameCore.GetPlayer().CheckWeaponPosition();
		}
	}

}
