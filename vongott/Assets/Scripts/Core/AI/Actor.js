#pragma strict

class Actor extends InteractiveObject {
	var head : Transform;
	var hand : Transform;
	var torso : Transform;
	var footRight : Transform;
	var footLeft : Transform;
	
	var displayName : String = "ActorName";
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
	@HideInInspector var shootTimer : float = 0;
	@HideInInspector var attentionTimer : float = 0;
	@HideInInspector var equippedItem : GameObject;
	@HideInInspector var updateTimer : float = 0;
	@HideInInspector var initPosition : Vector3;

	////////////////////
	// Init
	////////////////////
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
	
	
	////////////////////
	// Player interaction
	////////////////////
	function Talk () {
		if ( conversations.Count > 0 ) {
			conversations[currentConvo].Init ();
			
			if ( currentConvo < conversations.Count - 1 ) {
				currentConvo++;
			}
		}
	}
	
	function Say ( msg : String ) {
		UIHUD.ShowTimedNotification ( msg, 2.0 );
	}
	
	function TakeDamage ( damage : float ) {
		GameCore.Print ( "Actor | Damage to '" + displayName + "': " + damage );
	}
	
	
	////////////////////
	// Equipment
	////////////////////
	function GetEquipmentAttribute ( a : Item.Attributes ) : float {
		for ( var attr : Item.Attribute in equippedItem.GetComponent(Item).attr ) {
			if ( attr.type == a ) {
				return attr.val;
			} 
		}
		
		GameCore.Error ( "Actor | Found no attribute " + a + " for item " + equippedItem );
		
		return 100;
	}
	
	function Equip ( entry : Entry ) {
		equippedItem = Instantiate ( Resources.Load ( entry.model ) as GameObject );
		
		equippedItem.transform.parent = hand;
		equippedItem.transform.localPosition = Vector3.zero;
		equippedItem.transform.localEulerAngles = Vector3.zero;
		equippedItem.collider.enabled = false;
	
		GameCore.Print ( "Actor | '" + equippedItem.GetComponent(Item).title + "' equipped" );
	}

	function UnEquip () {
		Destroy ( equippedItem );
		
		GameCore.Print ( "Actor | unequipped" );
	}
	
	
	////////////////////
	// Shoot
	////////////////////
	function ResetFire () {
		shootTimer = GetEquipmentAttribute ( Item.Attributes.FireRate );
	}
	
	function Shoot () {		
		if ( !equippedItem ) { return; }		
		
		if ( shootTimer >= GetEquipmentAttribute ( Item.Attributes.FireRate ) ) {
			shootTimer = 0;
		
			var shootTarget : Vector3;
		
			if ( target.GetComponent ( Player ) ) {
				shootTarget = target.GetComponent ( Player ).torso.transform.position;
			} else if ( target.GetComponent ( Actor ) ) {
				shootTarget = target.GetComponent ( Actor ).torso.position;
			}
		
			var accuracyDecimal : float = 1.0 - ( GetEquipmentAttribute ( Item.Attributes.Accuracy ) / 100 );
			var accuracyDegree : float = Random.Range ( -accuracyDecimal, accuracyDecimal );
		
			shootTarget += Vector3.one * accuracyDegree;
		
			DamageManager.GetInstance().SpawnBullet ( equippedItem.transform.position, shootTarget, this.gameObject );
		}
	}
	
	////////////////////
	// Path finding
	////////////////////
	function FindPath ( v : Vector3 ) {
		this.GetComponent ( AStarPathFinder ).SetGoal ( v );
	}
		
	function ClearPath () {
		this.GetComponent ( AStarPathFinder ).ClearNodes ();
	}	
	
	function Chase ( t : Transform ) {
		if ( t ) {
			target = t;
			
			if ( inventory[0].model ) {
				Equip ( inventory[0] );
			}
			
			FindPath ( target.position );
			
			Say ( "Hey! You!" );
		
		} else {
			ClearPath ();
			
		}
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
	// Game loop
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
		var here : Vector3 = head.position;
		var there : Vector3 = GameCore.GetPlayerObject().GetComponent(Player).head.transform.position;
		var direction : Vector3 = there - here;
		var angle : float = Vector3.Angle ( direction, transform.forward );
		var hit : RaycastHit;
		
		// ^ The player is in sight
		if ( Physics.Raycast ( here, direction, hit, Mathf.Infinity ) && hit.collider.gameObject == GameCore.GetPlayerObject() ) {
			Debug.DrawLine ( here, there, Color.green );
			
			// Enemies chase the player
			if ( affiliation == "enemy" ) {
				if ( !target ) {
					Chase ( hit.collider.transform );
				}
				
				Shoot ();						
								
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
			attentionTimer = 0;
			updateTimer = 0;
			
		}
		
		// Shoot timer
		if ( equippedItem && shootTimer < GetEquipmentAttribute ( Item.Attributes.FireRate ) ) {
			shootTimer += Time.deltaTime;			
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