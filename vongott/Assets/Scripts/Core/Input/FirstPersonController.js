#pragma strict

class FirstPersonController {
	public static function Update ( player : Player, deltaVertical : float, deltaHorizontal : float ) {
		player.transform.rotation = Quaternion.Euler ( 0, Camera.main.transform.eulerAngles.y, 0 );

		player.transform.position = player.transform.position + ( player.transform.forward * ( deltaVertical / 25 ) ) + ( player.transform.right * ( deltaHorizontal / 35 ) );
	}
}
