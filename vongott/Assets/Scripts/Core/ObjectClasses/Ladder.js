#pragma strict

public class Ladder extends InteractiveObject {

	function Start () {

	}

	override function Interact () {
		GameCore.interactiveObjectLocked = true;
		
		PlayerController.SetClimbing ( true ); 

		InputManager.jumpFunction = Exit;
	}

	function Exit () {
		PlayerController.SetClimbing ( false );

		GameCore.interactiveObjectLocked = false;
	}

}
