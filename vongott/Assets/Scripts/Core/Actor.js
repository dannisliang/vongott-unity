#pragma strict

class Actor extends InteractiveObject {
	var name : String = "ActorName";
	var model : String;
	var affiliation : String;
	var mood : String;

	var path : List.< GameObject >;
	var inventory : Entry[] = new Entry [4];
	
	var conversations : List.< Conversation > = new List.< Conversation >();																																							
	var target : Transform;

	@HideInInspector var currentConvo : int = 0;
	@HideInInspector var currentNode : int = 0;
	@HideInInspector var currentLine : int = 0;
	@HideInInspector var nodeTimer : float = 0;
	@HideInInspector var fireTimer : float = 0;
	@HideInInspector var equippedItem : GameObject;

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
		
		if ( inventory[0].model ) {
			Equip ( inventory[0] );
		}
		
		Say ( "Hey! You!" );
	}	
	
	function GiveUp () {
		target = null;
		
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
		
		// use affiliation
		if ( affiliation == "enemy" ) {
			// detect player
			if ( !Physics.Linecast ( this.transform.position + new Vector3 ( 0, 1, 0 ), GameCore.GetPlayerObject().transform.position + new Vector3 ( 0, 1, 0 ), 9 ) && !target ) {
				Detect();
			}
		}
		
		// follow the player
		if ( target ) {
			//this.gameObject.GetComponent ( PathFinder ).Chase ( target );
			
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
		}
	}
}