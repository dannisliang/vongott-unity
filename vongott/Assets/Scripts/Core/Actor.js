#pragma strict

private class PathNode {
	var position : Vector3;
	var duration : float;

	function PathNode ( p : Vector3, d : float ) {
		position = p;
		duration = d;
	}
}

class Actor extends MonoBehaviour {
	var model : String;
	var affiliation : String;
	var mood : String;

	var speed : float = 4.0;
	var path : List.< PathNode > = new List.< PathNode >();
	var target : Transform;

	@HideInInspector var currentNode : int = 0;

	function Start () {
		path.Clear ();
		path.Add ( new PathNode ( transform.position, 0 ) );
	}
	
	function Update () {
		var forward = transform.TransformDirection (Vector3.forward);
		
/*		if ( Vector3.Distance ( transform.position, GameCore.playerObject.transform.position ) < 100 ) {
			target = GameCore.playerObject.transform;
		} else {
			target = null;
		}*/
		
		// follow the player
		if ( target ) {	
			var distance = Vector3.Distance ( transform.position, target.position );
			var hits : RaycastHit[] = Physics.RaycastAll ( transform.position, forward, distance );
			
			transform.LookAt(target);
		 
		 	for ( var hit : RaycastHit in hits ) {
				if ( hit.collider != target.collider ) {
					return;
				}
			}
			
			if ( distance > 10.0 ) {
				transform.position += transform.forward * speed * Time.deltaTime;
			}
		
		// follow path
		} else if ( path.Count > 1 ) {
			if ( Vector3.Distance ( transform.position, path[currentNode].position ) < 1 ) {
				if ( currentNode < path.Count - 1 ) {
					currentNode++;
				} else {
					currentNode = 0;
				}
			}
			
			transform.LookAt ( path[currentNode].position );
			
			transform.position += transform.forward * speed * Time.deltaTime;
		}
	}
}