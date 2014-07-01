#pragma strict

class OPPathFinder extends MonoBehaviour {
	public var currentNode : int = 0;
	public var scanner : OPScanner;
	public var speed : float = 4.0;
	public var stoppingDistance : float = 0.5;
	public var nodeDistance : float = 1.0;
	public var target : Transform;
	public var autoChase : boolean = false;
	public var raycastToGoal : boolean = true;
	public var raycastDistance : float = 5;
	public var updateDelay : float = 1;
		
	@NonSerialized public var nodes : OPNode[] = new OPNode[0];
	
	private var goal : Vector3;
	private var updateTimer : float = 0;

	public function get atEndOfPath () : boolean {
		return currentNode >= nodes.Length || ( transform.position - goal ).magnitude <= stoppingDistance;
	}

	public function get hasPath () : boolean { 
		return nodes.Length > 0;
	}

	function Start () {
		scanner = GameObject.FindObjectOfType(OPScanner);
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
			return this.transform.position;

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
		SetGoal ( v, false );
	}
	
	public function SetGoal ( v : Vector3, persist : boolean ) {
		if ( goal == v ) { return; }
				
		goal = v;
		UpdatePosition ( persist );
	}
	
	public function GetGoal () : Vector3 {
		return goal;
	}
		
	public function UpdatePosition ( persist : boolean ) {
		if ( !scanner ) { return; }

		StartCoroutine ( function () : IEnumerator {
			if ( persist ) {
				while ( updateTimer > 0 ) {
					yield null;
				}

				while ( scanner.searching ) {
					yield null;
				}
			}
			
			if ( !scanner.searching && updateTimer <= 0 ) {
				ClearNodes ();
			
				var start : Vector3 = this.transform.position;
			
				var tempNodes : List.< OPNode > = new List.< OPNode > ();
				
				yield scanner.FindPath ( start, goal, tempNodes );
				
				nodes = tempNodes.ToArray ();

				for ( var i : int = 0; i < nodes.Length; i++ ) {
					nodes[i].active = true;
				}
				
				if ( nodes.Length > 1 ) {
					currentNode = 1;
				
				} else {
					currentNode = 0;

				}

				updateTimer = updateDelay;
			}
		} () );
	}

	function Update () {
		if ( updateTimer > 0 ) {
			updateTimer -= Time.deltaTime;
		}
		
		if ( scanner ) {
			// If there are nodes to follow		
			if ( nodes && nodes.Length > 0 && currentNode < nodes.Length ) {
				if ( ( transform.position - nodes[currentNode].position ).magnitude <= stoppingDistance ) {
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
