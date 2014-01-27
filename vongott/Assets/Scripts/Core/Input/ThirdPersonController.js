#pragma strict

class ThirdPersonController {
	public static function Update ( player : Player, deltaVertical : float, deltaHorizontal : float ) {
		var targetRotation : float = GameCamera.GetInstance().transform.eulerAngles.y;

		// Right forward
		if ( deltaHorizontal == 1 && deltaVertical == 1 ) {
			targetRotation += 45;
		
		// Left forward
		} else if ( deltaHorizontal == -1 && deltaVertical == 1 ) {
			targetRotation -= 45;
		
		// Left back
		} else if ( deltaHorizontal == -1 && deltaVertical == -1 ) {
			targetRotation -= 135;
		
		// Right back
		} else if ( deltaHorizontal == 1 && deltaVertical == -1 ) {
			targetRotation += 135;
		
		// Left
		} else if ( deltaHorizontal == -1 && deltaVertical == 0 ) {
			targetRotation -= 90;
		
		// Right
		} else if ( deltaHorizontal == 1 && deltaVertical == 0 ) {
			targetRotation += 90;
		
		// Back
		} else if ( deltaVertical == -1 && deltaHorizontal == 0 ) {
			targetRotation += 180;
		
		}
		
		var rotationQuaternion : Quaternion = Quaternion.Euler ( 0, targetRotation, 0 );
			
		player.transform.rotation = Quaternion.Slerp ( player.transform.rotation, rotationQuaternion, 5 * Time.deltaTime );
	}

	// For locked rotation
	public static function Update ( player : Player, deltaVertical : float, lockedRotation : Vector3 ) {
		player.transform.rotation = Quaternion.Slerp ( player.transform.rotation, Quaternion.Euler ( lockedRotation ), 5 * Time.deltaTime );
	}
}
