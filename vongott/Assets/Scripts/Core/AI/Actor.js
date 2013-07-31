#pragma strict

class Actor extends InteractiveObject {
	var name : String = "ActorName";
	var model : String;
	var affiliation : String;
	var mood : String;
	var attentionSpan : float = 30.0;
	var updateFrequency : float = 5.0;
	var speed : float = 4.0;

	var path : List.< GameObject >;
	var inventory : Entry[] = new Entry [4];
	
	var conversations : List.< Conversation > = new List.< Conversation >();																																							
	var target : Transform;

	@HideInInspector var currentConvo : int = 0;
	@HideInInspector var currentNode : int = 0;
	@HideInInspector var currentLine : int = 0;
	@HideInInspector var nodeTimer : float = 0;
	@HideInInspector var fireTimer : float = 0;
	@HideInInspector var attentionTimer : float = 0;
	@HideInInspector var equippedItem : GameObject;
	@HideInInspector var updateTimer : float = 0;
	@HideInInspector var initPosition : Vector3;

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
		
		initPosition = this.transform.position;
		
		if ( !GameCore.started ) {
			this.GetComponent ( AStarPathFinder ).enabled = false;
		} else {
			this.GetComponent ( AStarPathFinder ).scanner = GameCore.scanner;
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
	
	function FindPath ( v : Vector3 ) {
		this.GetComponent ( AStarPathFinder ).SetGoal ( v );
	}
	
	function Chase ( t : Transform ) {
		target = t;
		
		if ( inventory[0].model ) {
			Equip ( inventory[0] );
		}
		
		FindPath ( target.position );
		
		Say ( "Hey! You!" );
	}
	
	function GiveUp () {
		target = null;
		
		FindPath ( initPosition );
		
		UnEquip ();
		
		Say ( "Bah! Whatever, man." );
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
		
		// Detect player
		var here : Vector3 = this.transform.position + new Vector3 ( 0, 1, 0 );
		var there : Vector3 = GameCore.GetPlayerObject().transform.position + new Vector3 ( 0, 1, 0 );
		
		// ^ The player is in sight
		if ( !Physics.Linecast ( here, there ) ) {
			Debug.DrawLine ( here, there, Color.green );
			
			// Enemies chase the player
			if ( affiliation == "enemy" ) {
				if ( !target ) {
					Chase ( GameCore.GetPlayerObject().transform );
				}
							
			// Allies might call for the player's attention
			} else if ( affiliation == "ally" ) {
				//Say ( "Yoohoo!" );
			
			}
		
		// ^ The player is out of sight
		} else {
		
		}
		
		// Attention span & update frequency
		if ( target ) {			
			if ( updateTimer < updateFrequency ) {
				updateTimer += Time.deltaTime;
			} else {
				updateTimer = 0;
				FindPath ( target.position );
			}
			
			if ( attentionTimer < attentionSpan ) {
				attentionTimer += Time.deltaTime;
			} else {
				attentionTimer = 0;
				GiveUp ();
			}
			
		} else {
			attentionTimer = attentionSpan;
			updateTimer = 0;
			
		}
		
		/*
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
				transform.position += transform.forward * 4 * Time.deltaTime;
			} else {
				nodeTimer -= Time.deltaTime;
			}
		}*/
	}
}