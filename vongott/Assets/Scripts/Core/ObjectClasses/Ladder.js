#pragma strict

public class Ladder extends InteractiveObject {

	private var adjacentLadders : Ladder [];

	public function GetHighestPoint () : float {
		var point : float = this.transform.position.y + collider.bounds.max.y;
		
		for ( var i : int = 0; i < adjacentLadders.Length; i++ ) {
			if ( adjacentLadders[i].collider.bounds.max.y > point ) {
				point = adjacentLadders[i].collider.bounds.max.y;
			}
		}	

		return point;
	}

	public function GetLowestPoint () : float {
		var point : float = this.transform.position.y;
		
		for ( var i : int = 0; i < adjacentLadders.Length; i++ ) {
			if ( adjacentLadders[i].transform.position.y < point ) {
				point = adjacentLadders[i].transform.position.y;
			}
		}	

		return point;
	}

	function Start () {
		var tempList : List.< Ladder > = new List.< Ladder > ();

		for ( var l : Ladder in GameObject.FindObjectsOfType(typeof(Ladder)) ) {
			if ( l.transform.position.x == this.transform.position.x && l.transform.position.z == this.transform.position.z && l.transform.localEulerAngles == this.transform.localEulerAngles ) {
				tempList.Add ( l );
			}
		}

		adjacentLadders = tempList.ToArray();
	}
	
	override function InvokePrompt () {
		UIHUD.GetInstance().ShowNotification ( "Climb" );
	}

	override function Interact () {
		GameCore.interactiveObjectLocked = true;
		
		PlayerController.SetClimbing ( true, this );

		InputManager.jumpFunction = Exit;
	}

	public function Exit () {
		PlayerController.SetClimbing ( false );

		GameCore.interactiveObjectLocked = false;
	}

}
