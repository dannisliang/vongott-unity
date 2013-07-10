#pragma strict

class DijkstraCurrentNode extends MonoBehaviour {
	var currentNode : GameObject;

	function Start () {
		SetCurrentNode ();
	}
	
	function Update () {
		SetCurrentNode ();
	}
	
	function SetCurrentNode () {
		var shortestDistance : float = Mathf.Infinity;
	
		for ( var obj : GameObject in GameObject.FindGameObjectsWithTag ( "Node" ) ) {
			var dist : float = ( obj.transform.position - transform.position ).magnitude;
			
			if ( dist < shortestDistance ) {
				shortestDistance = dist;
				currentNode = obj;
			}
		}
	}
}