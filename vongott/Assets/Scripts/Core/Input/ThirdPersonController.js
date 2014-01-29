#pragma strict

class ThirdPersonController {
	public static function Update ( player : Player, deltaVertical : float, deltaHorizontal : float ) {
		if ( deltaVertical != 0 || deltaHorizontal != 0 ) {
			var targetRotation : float = Camera.main.transform.eulerAngles.y;
			var angle = Mathf.Atan2 ( deltaVertical, -deltaHorizontal ) * Mathf.Rad2Deg;
			targetRotation += angle - 90;

			var rotationQuaternion : Quaternion = Quaternion.Euler ( 0, targetRotation, 0 );
				
			player.transform.rotation = Quaternion.Slerp ( player.transform.rotation, rotationQuaternion, 5 * Time.deltaTime );
		}
	}

	// For locked rotation
	public static function Update ( player : Player, deltaVertical : float, lockedRotation : Vector3 ) {
		player.transform.rotation = Quaternion.Slerp ( player.transform.rotation, Quaternion.Euler ( lockedRotation ), 5 * Time.deltaTime );
	}
}
