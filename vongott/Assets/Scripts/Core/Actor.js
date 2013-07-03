#pragma strict

class Actor extends InteractiveObject {
	var name : String = "ActorName";
	var model : String;
	var affiliation : String;
	var mood : String;

	var speed : float = 4.0;
	var path : List.< GameObject >;
	var viewDistance : float = 20.0;
	var keepDistance : float = 10.0;
	var inventory : Entry[] = new Entry [4];
	
	var conversations : List.< Conversation > = new List.< Conversation >();
																																									
	@HideInInspector var target : Transform;
	@HideInInspector var lastKnownPosition : GameObject;

	@HideInInspector var currentConvo : int = 0;
	@HideInInspector var currentNode : int = 0;
	@HideInInspector var currentLine : int = 0;
	@HideInInspector var nodeTimer : float = 0;
	@HideInInspector var fireTimer : float = 0;
	@HideInInspector var equippedItem : GameObject;
	@HideInInspector var action : String = "";

	function Equip ( entry : Entry ) {
		equippedItem = Instantiate ( Resources.Load ( entry.model ) as GameObject );
		
		equippedItem.transform.parent = transform;
		equippedItem.transform.localPosition = Vector3.zero;
		equippedItem.transform.localEulerAngles = Vector3.zero;
		equippedItem.collider.enabled = false;
	
		GameCore.Print ( "Actor | '" + entry.title + "' equipped" );
	}

	function UnEquip () {
		Destroy ( equippedItem );
		
		GameCore.Print ( "Actor | unequipped" );
	}

	function Say ( msg : String ) {
		UIHUD.ShowTimedNotification ( msg, 2.0 );
	}

	function Start () {
		if ( !path ) {
			path = new List.< GameObject >();
		}
	}
	
	function Talk () {
		if ( conversations.Count > 0 ) {
			conversations[currentConvo].Init ();
			
			if ( currentConvo < conversations.Count - 1 ) {
				currentConvo++;
			}
		}
	}
	
	function Strike () {
	
	}
	
	function Shoot () {
		var w : String[] = new String[5];
		w[0] = "bang!";
		w[1] = "boom!";
		w[2] = "ratatat!";
		w[3] = "biff!";
		w[4] = "krakow!";
		
		Say ( w [ currentLine ] );
		fireTimer = 0.5;
		
		if ( currentLine < w.Length - 1 ) {
			currentLine++;
		} else {
			currentLine = 0;
		}
	}
	
	function Detect () {
		target = GameCore.playerObject.transform;
		
		transform.LookAt ( target );
		
		if ( lastKnownPosition ) {
			DestroyImmediate ( lastKnownPosition );
			lastKnownPosition = null;
		}
		
		action = "chasing";
		
		Equip ( inventory[0] );
		Say ( "Hey! You!" );
	}	
	
	function GiveUp () {
		target = null;
		
		UnEquip ();
		Say ( "Bah! Whatever, man." );
	}
	
	function LostSight () {
		lastKnownPosition = new GameObject ( "LastKnownPosition" );
		lastKnownPosition.transform.localPosition = target.localPosition;
		target = lastKnownPosition.transform;
	}
	
	function GetDirection ( pos : Vector3, direction : Vector3 ) : Vector3 {
		var hit : RaycastHit;
		
		if ( Physics.Raycast ( pos, transform.forward, hit, viewDistance ) ) {
			if ( hit.transform != transform ) {
				direction += hit.normal * 20;
			}
		}
		
		return direction;
	}
	
	
	/////////////////////
	// Update
	/////////////////////
	function Update () {
		if ( !GameCore.started ) { return; }
		
		var forward = transform.TransformDirection (Vector3.forward);
		
		// check for interaction
		if ( GameCore.GetInteractiveObject() == this.gameObject && affiliation == "ally" && GameCore.controlsActive ) {
			UIHUD.ShowNotification ( "Talk [F]" );
			
			if ( Input.GetKeyDown(KeyCode.F) ) {
				Talk();
				UIHUD.ShowNotification ( "" );
			}
		}
		
		// use affiliation
		if ( affiliation == "enemy" ) {
			// detect player
			if ( Vector3.Distance ( transform.position, GameCore.playerObject.transform.position ) < 20 && !target ) {
				Detect();
			
			// player too far away
			} else if ( Vector3.Distance ( transform.position, GameCore.playerObject.transform.position ) > 40 && target ) {
				GiveUp();
			
			}
		}
		
		// follow the player
		if ( target ) {	
			var distance = Vector3.Distance ( transform.position, target.position );
			var direction = (target.position - transform.position).normalized;
			
			// chase		
			if ( action == "chasing" ) {
				// forward raycast
				direction = GetDirection ( transform.position, direction );
				
				// left raycast
				var leftR = transform.position;
				leftR.x -= 2;
				direction = GetDirection ( leftR, direction );
				
				// right raycast
				var rightR = transform.position;
				rightR.x += 2;
				direction = GetDirection ( rightR, direction );
				
				// position
				var rotation = Quaternion.LookRotation ( direction );
				transform.rotation = Quaternion.Slerp ( transform.rotation, rotation, Time.deltaTime );
				transform.position += transform.forward * speed * Time.deltaTime;
				
				if ( distance < keepDistance ) {
					action = "shooting";
				}
			
			// shoot
			} else if ( action == "shooting" ) {
				transform.LookAt ( target );
				
				if ( fireTimer <= 0.0 ) {
					fireTimer = 0.5;
					Shoot ();
				} else {
					fireTimer -= Time.deltaTime;
				}
				
				if ( distance > keepDistance ) {
					action = "chasing";
				}
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