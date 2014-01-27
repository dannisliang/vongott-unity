#pragma strict

enum ePathMovement {
	Walk,
	Run,
	Teleport
}

class PathNode {
	public var duration : float = 0;
	public var position : Vector3;
	public var movement : ePathMovement;

	public function SetMovement ( type : String ) {
		switch ( type ) {
			case "Run":
				movement = ePathMovement.Run;
				break;
			
			case "Teleport":
				movement = ePathMovement.Teleport;
				break;
			
			default:
				movement = ePathMovement.Walk;
				break;
		}
	}
}
