#pragma strict

class PlayerController extends MonoBehaviour {
	enum PlayerState {
		Idle,
		Walking,
		Running,
		Sprinting,
		Jumping
	}
	
	var state : PlayerState = PlayerState.Idle;
	var speed : float = 0.0;

	function Update () {
		if ( Input.GetKey ( KeyCode.LeftShift ) ) {
			state = PlayerState.Running;
		
		} else if ( Input.GetKeyDown ( KeyCode.Space ) ) {
			state = PlayerState.Jumping;
			
		} else {
			state = PlayerState.Walking;
		
		}
		
		// Get input
		var v = Input.GetAxisRaw("Vertical");
		var h = Input.GetAxisRaw("Horizontal");
				
		// Set speed		
		if ( v != 0.0 || h != 0.0 ) {
			// Set rotation
			var camTarget : Transform = CameraTarget.instance;
			var rotationTarget : Quaternion = Quaternion.Euler ( transform.eulerAngles.x, camTarget.eulerAngles.y, transform.eulerAngles.z );
			
			transform.rotation = Quaternion.Slerp ( transform.rotation, rotationTarget, 5 * Time.deltaTime );
			
			if ( speed < 0.1 ) { speed = 0.1; }
			
			if ( state == PlayerState.Walking ) {
				if ( speed < 0.25 ) {
					speed += 0.01;
				} else if ( speed > 0.30 ) {
					speed -= 0.01;
				}
				
			} else if ( state == PlayerState.Running ) {
				if ( speed < 0.5 ) {	
					speed += 0.01;
				}
			}
							
		} else if ( speed > 0.0 ) {
			speed -= 0.1;
		
		} 
		
		this.GetComponent(Animator).SetFloat("Speed", speed );
	}
}