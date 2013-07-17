#pragma strict

class DijkstraCurrentNode extends MonoBehaviour {
	var currentNode : GameObject;
	var isNPC : boolean = true;

	function Start () {
		SetCurrentNode ();
	}
	
	function Update () {
		if ( !isNPC || currentNode == null ) {
			SetCurrentNode ();
		}
	}
	
	function OnTriggerEnter ( col : Collider ) {
		if ( col.tag == "PathNode" ) {
			currentNode = col.gameObject;
		}
	}
	
	function SetCurrentNode () {
		var shortestDistance : float = Mathf.Infinity;

/*		for ( var obj : GameObject in GameObject.FindGameObjectsWithTag ( "Node" ) ) {
			var dist : float = ( obj.transform.position - transform.position ).magnitude;
			
			if ( dist < shortestDistance ) {
				shortestDistance = dist;
				currentNode = obj;
			}
		}*/
	}
}