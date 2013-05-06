#pragma strict

class Actor extends MonoBehaviour {
	var model : String;
	var affiliation : String;
	var mood : String;

	var speed : float = 4.0;
	var path : List.< GameObject >;
	var target : Transform;

	@HideInInspector var currentNode : int = 0;
	@HideInInspector var nodeTimer : float = 0;

	function Start () {
		if ( !path ) {
			path = new List.< GameObject >();
		}
	}
	
	function Update () {
		if ( !GameCore.started ) { return; }
		
		var forward = transform.TransformDirection (Vector3.forward);
		
		// use affiliation
		if ( affiliation == "enemy" ) {
			// detect player
			if ( Vector3.Distance ( transform.position, GameCore.playerObject.transform.position ) < 20 ) {
				target = GameCore.playerObject.transform;
			} else if ( Vector3.Distance ( transform.position, GameCore.playerObject.transform.position ) > 40 ) {
				target = null;
			}
			
			// disable conversation
			this.gameObject.GetComponent(Conversation).enabled = false;
		
		} else {
			
			// enable conversation
			this.gameObject.GetComponent(Conversation).enabled = true;
		}
		
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
			if ( Vector3.Distance ( transform.position, path[currentNode].transform.position ) < 0.1 ) {
				transform.localEulerAngles = path[currentNode].transform.localEulerAngles;
				
				nodeTimer = path[currentNode].GetComponent(PathNode).duration;
				
				
				if ( currentNode < path.Count - 1 ) {
					currentNode++;
				} else {
					currentNode = 0;
				}
			}
			
			if ( nodeTimer <= 0 ) {
				transform.LookAt ( path[currentNode].transform.position );
				transform.position += transform.forward * speed * Time.deltaTime;
			} else {
				nodeTimer -= Time.deltaTime;
			}
		}
	}
}