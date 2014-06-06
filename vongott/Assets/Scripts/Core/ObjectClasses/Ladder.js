#pragma strict

public class Ladder extends MonoBehaviour {
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
	
	public function OnTriggerEnter ( c : Collider ) {
		var player : Player = c.gameObject.GetComponent.< Player > ();

		if ( player ) {
			player.controller.SetLadder ( this );
		}
	}

}
