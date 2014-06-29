#pragma strict

class OPPathFinder extends MonoBehaviour {
	public var currentNode : int = 0;
	public var scanner : OPScanner;
	public var speed : float = 4.0;
	public var stoppingDistance : float = 0.1;
	public var nodeDistance : float = 1.0;
	public var target : Transform;
	public var autoChase : boolean = false;
	public var raycastToGoal : boolean = true;
	public var raycastDistance : float = 5;
	
	@NonSerialized public var nodes : OPNode[] = new OPNode[0];
	
	private var goal : Vector3;
	
	public function SetGoalAfterSeconds ( s : float ) : IEnumerator {
		yield WaitForSeconds ( s );
				
		SetGoal ( target );
	}
	
	function Start () {
		scanner = GameObject.FindObjectOfType(OPScanner);
		
		if ( target != null ) {
			StartCoroutine ( SetGoalAfterSeconds ( 2 ) );
		}
	}
	
	public function ClearNodes () {
		for ( var node : OPNode in nodes ) {
			node.active = false;
			node.parent = null;
		}
		
		nodes = new OPNode[0];	
	}
	
	public function GetCurrentNode () : Vector3 {
		if ( currentNode < nodes.Length ) {
			return nodes[currentNode].position;
		
		} else {
			return goal;

		}
	}

	public function GetCurrentGoal () : Vector3 {
		var here : Vector3 = this.transform.position + Vector3.up * 0.1;
		var there : Vector3 = goal + Vector3.up * 0.1;
		var realDistance : float = Vector3.Distance ( here, there );
		var rayDistance : float = Mathf.Clamp ( 0, raycastDistance, realDistance );
		var hit : RaycastHit;
	       
		// Only consider hits within a certain range
		if ( realDistance <= rayDistance ) {
			// We hit something
			if ( Physics.Raycast ( here, there - here, hit, rayDistance ) ) {
				// If the hit is this object, try again
				if ( hit.collider.gameObject == this.gameObject ) {
					here = hit.point;
				}

				// If we hit something (again), return the current node
				if ( Physics.Raycast ( here, there - here, hit, rayDistance ) ) {
					return GetCurrentNode ();			

				// If not, then the goal is in plain sight
				} else {
					return goal;

				}

			// We hit nothing, the goal is in plain sight
			} else {
				return goal;	
			
			}
		
		} else {
			return GetCurrentNode ();
		
		}	
	}

	public function SetGoal ( t : Transform ) {
		// If there is a goal, create the nodes
		if ( t ) {
			SetGoal ( t.position );
		
		} else {
			ClearNodes ();
		
		}
	}
	
	public function SetGoal ( v : Vector3 ) {
		if ( goal == v ) { return; }
				
		ClearNodes ();
		goal = v;
		UpdatePosition ();
	}
	
	public function GetGoal () : Vector3 {
		return goal;
	}
		
	public function UpdatePosition () {
		if ( scanner ) {
			
			var start : Vector3 = this.transform.position;
						
			nodes = scanner.FindPath ( start, goal );
									
			for ( var i : int = 0; i < nodes.Length; i++ ) {
				nodes[i].active = true;
			}
			
			currentNode = 0;
		}
	}

	function Update () {
		if ( scanner ) {
			// If there are nodes to follow		
			if ( nodes && nodes.Length > 0 ) {
				if ( ( transform.position - nodes[currentNode].position ).magnitude < nodeDistance && currentNode < nodes.Length - 1 ) {
					currentNode++;
				}

				if ( autoChase ) {
					var lookPos : Vector3 = ( nodes[currentNode] as OPNode ).position - transform.position;
					lookPos.y = 0;
					
					transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), 8 * Time.deltaTime );			
					transform.localPosition += transform.forward * speed * Time.deltaTime;
				}
			
				if ( ( transform.position - goal ).magnitude <= stoppingDistance ) {
					ClearNodes ();
				}
			}
		}
	}
}
