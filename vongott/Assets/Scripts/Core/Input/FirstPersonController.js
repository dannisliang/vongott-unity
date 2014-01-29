#pragma strict

class FirstPersonController {
	public static function Update ( player : Player, deltaVertical : float, deltaHorizontal : float ) {
		player.transform.rotation = Quaternion.Euler ( 0, Camera.main.transform.eulerAngles.y, 0 );
	}
}
