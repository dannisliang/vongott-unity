#pragma strict

class Actor extends InteractiveObject {
	private class VisionCone {
		var distance : float = 20.0;
		var angle : float = 22.5;
		var layerMask : LayerMask;
	}
	
	public enum eAffiliation {
		Enemy,
		Ally
	}
	
	public enum eMood {
		Calm,
		Alert,
		Aggressive
	}
	
	public enum eVitalState {
		Alive,
		Unconcious,
		Dead
	}
	
	var head : Transform;
	var hand : Transform;
	var torso : Transform;
	var footRight : Transform;
	var footLeft : Transform;
	
	var displayName : String = "ActorName";
	var model : String;
	var affiliation : eAffiliation;
	var mood : eMood;
	var vitalState : eVitalState;
	var attentionSpan : float = 30.0;
	var updateFrequency : float = 5.0;
	var keepDistance : float = 10.0;
	var runningSpeed : float = 4.0;
	var vision : VisionCone = new VisionCone();
	var hearing : float = 10;

	var path : List.< GameObject >;
	var inventory : InventoryEntry[] = new InventoryEntry [4];
	
	var conversations : List.< Conversation > = new List.< Conversation >();																																							
	var target : Transform;

	var speed : float = 0.0;
	var aiming : boolean = false;

	@HideInInspector var currentConvo : int = 0;
	@HideInInspector var currentNode : int = 0;
	@HideInInspector var currentLine : int = 0;
	@HideInInspector var nodeTimer : float = 0;
	@HideInInspector var shootTimer : float = 0;
	@HideInInspector var attentionTimer : float = 0;
	@HideInInspector var equippedItem : GameObject;
	@HideInInspector var updateTimer : float = 0;
	@HideInInspector var initPosition : Vector3;
	@HideInInspector var canShoot : boolean = false;
	

	@HideInInspector var pathFinder : AStarPathFinder;
				

	////////////////////
	// Init
	////////////////////
	// Start
	function Start () {
		if ( !path ) {
			path = new List.< GameObject >();
		}
		
		pathFinder = this.GetComponent ( AStarPathFinder );
		
		initPosition = this.transform.position;
		
		if ( !GameCore.started ) {
			this.GetComponent ( AStarPathFinder ).enabled = false;
			this.GetComponent ( Animator ).enabled = false;
			Destroy ( this.rigidbody );
		} else {
			this.GetComponent ( AStarPathFinder ).scanner = GameCore.scanner;
		}
	}
	
	// Get affiliation
	public function SetAffiliation ( str : String ) {
		if ( str == "enemy" || str == "Enemy" ) {
			affiliation = eAffiliation.Enemy;
		} else {
			affiliation = eAffiliation.Ally;
		}
	}
	
	// Get mood
	public function SetMood ( str : String ) {
		if ( str == "aggressive" || str == "Aggressive" ) {
			mood = eMood.Aggressive;
		
		} else if ( str == "alert" || str == "Alert" ) {
			mood = eMood.Alert;
		
		} else {
			mood = eMood.Calm;
		
		}
	}
	
	// Get vital state
	public function SetVitalState ( str : String ) {
		if ( str == "dead" || str == "Dead" ) {
			vitalState = eVitalState.Dead;
		
		} else if ( str == "unconscious" || str == "Unconscious" ) {
			vitalState = eVitalState.Unconcious;
		
		} else {
			vitalState = eVitalState.Alive;
		
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
	function GetEquipmentAttribute ( a : Item.eItemAttribute ) : float {
		for ( var attr : Item.Attribute in equippedItem.GetComponent(Item).attr ) {
			if ( attr.type == a ) {
				return attr.val;
			} 
		}
		
		GameCore.Error ( "Actor | Found no attribute " + a + " for item " + equippedItem );
		
		return 100;
	}
	
	function Equip ( entry : InventoryEntry ) {
		var item : Item = Instantiate ( entry.GetItem() ) as Item;
		equippedItem = item.gameObject;
		
		equippedItem.transform.parent = hand;
		equippedItem.transform.localPosition = new Vector3 ( -0.4400277, -0.1216161, 0.187489 );
		equippedItem.transform.localEulerAngles = new Vector3 ( 85.41418, 290.4283, 271 );
		equippedItem.GetComponent(BoxCollider).enabled = false;
		equippedItem.GetComponent(SphereCollider).enabled = false;
		equippedItem.GetComponent ( DontGoThroughThings ).enabled = false;
		Destroy ( equippedItem.rigidbody );
		
	
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
		shootTimer = GetEquipmentAttribute ( Item.eItemAttribute.FireRate );
	}
	
	function Shooting () {						
		if ( equippedItem && shootTimer >= GetEquipmentAttribute ( Item.eItemAttribute.FireRate ) ) {
			shootTimer = 0;
		
			var shootTarget : Vector3;
		
			if ( target.GetComponent ( Player ) ) {
				shootTarget = target.GetComponent ( Player ).torso.transform.position;
			} else if ( target.GetComponent ( Actor ) ) {
				shootTarget = target.GetComponent ( Actor ).torso.position;
			}
		
			var accuracyDecimal : float = 1.0 - ( GetEquipmentAttribute ( Item.eItemAttribute.Accuracy ) / 100 );
			var accuracyDegree : float = Random.Range ( -accuracyDecimal, accuracyDecimal );
		
			shootTarget += Vector3.one * accuracyDegree;
		
			DamageManager.GetInstance().SpawnBullet ( equippedItem, shootTarget, this.gameObject );
		
			// Muzzle flash
			if ( equippedItem.transform.GetChild(0) ) {
				equippedItem.transform.GetChild(0).gameObject.SetActive ( true );
			}
		}
		
		speed = 0;
		aiming = true;
	}
	
	////////////////////
	// Path finding
	////////////////////
	function FindPath ( v : Vector3 ) {
		this.GetComponent ( AStarPathFinder ).SetGoal ( v );
	}
		
	function ClearPath () {
		if ( this.GetComponent ( AStarPathFinder ).nodes.Count > 0 ) {
			this.GetComponent ( AStarPathFinder ).ClearNodes ();
		}
	}	
	
	function StartChase ( t : Transform ) {
		if ( t ) {
			target = t;
			
			if ( inventory[0] ) {
				Equip ( inventory[0] );
			}
						
			Say ( "Hey! You!" );
		
		} else {
			ClearPath ();
			
		}
	}
	
	function TurnTowards ( v : Vector3 ) {
		var lookPos : Vector3 = v - transform.position;
		lookPos.y = 0;
		
		transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), 4 * Time.deltaTime );
	}
	
	function MoveForward () {			
		speed = Mathf.Lerp ( speed, 1.0, Time.deltaTime * 5 );
		
		transform.localPosition += speed * ( transform.forward * runningSpeed * Time.deltaTime );
	}
	
	function Approaching ( t : Transform ) {
		ClearPath ();
		
		if ( ( transform.position - t.position ).magnitude > keepDistance ) {
			TurnTowards ( t.position );		
			MoveForward ();
		
		} else {
			TurnTowards ( t.position );
			speed = 0.0;
			
		}
		
		canShoot = ( transform.position - t.position ).magnitude < keepDistance * 2;
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
		if ( GameCore.GetInteractiveObject() == this.gameObject && affiliation == eAffiliation.Ally && GameCore.controlsActive ) {
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
		var angle : float = Vector3.Angle ( forward, direction );
		var distance : float = direction.magnitude;
		var hit : RaycastHit;
		
		var inSight : boolean = angle < vision.angle && Physics.Raycast ( here, direction, hit, vision.distance, vision.layerMask ) && hit.collider.gameObject == GameCore.GetPlayerObject();
		var inEarshot : boolean = distance < hearing && GameCore.GetPlayerObject().GetComponent(PlayerController).runningSpeed > 0.5;
		
		aiming = false;
																										
		// ^ The player is in sight
		if ( inSight ) {
			// Draw sight
			Debug.DrawLine ( here, there, Color.green );
			
			// Enemies shoot the player			
			if ( affiliation == eAffiliation.Enemy ) {
				if ( !target ) {
					StartChase ( hit.collider.transform );
				}
								
				Approaching ( target );
								
				if ( canShoot ) {
					Shooting ();						
				}
												
			// Allies might call for the player's attention
			} else if ( affiliation == eAffiliation.Ally ) {
				//Say ( "Yoohoo!" );
			
			}
			
			// Reset timers
			attentionTimer = 0;
			updateTimer = updateFrequency;
		
		// ^ The player is out of sight
		} else if ( affiliation == eAffiliation.Enemy ) {			
			Debug.DrawRay ( here, transform.forward * vision.distance, Color.red );
			
			// The player is a target
			if ( target ) {
				// Update frequency
				if ( updateTimer < updateFrequency ) {
					updateTimer += Time.deltaTime;
				} else {
					updateTimer = 0;
					FindPath ( target.position );
				}
				
				// Follow path
				if ( pathFinder.nodes.Count > 0 ) {
					TurnTowards ( ( pathFinder.nodes[pathFinder.currentNode] as AStarNode ).position );
					MoveForward ();
				}
																
				// Attention span
				if ( attentionTimer < attentionSpan ) {
					attentionTimer += Time.deltaTime;
				} else {
					attentionTimer = 0;
					GiveUp ();
				}
			
			// The player is within earshot
			} else if ( inEarshot ) {
				StartChase ( GameCore.GetPlayerObject().GetComponent(Player).transform );
				
				// Reset timers
				attentionTimer = 0;
				updateTimer = updateFrequency;
			
			} else {			
				attentionTimer = 0;
				updateTimer = 0;
		
			}	
		}
		
		// Shoot timer
		if ( equippedItem && shootTimer < GetEquipmentAttribute ( Item.eItemAttribute.FireRate ) ) {
			shootTimer += Time.deltaTime;			
		}
		
		this.GetComponent(Animator).SetFloat("Speed", speed );
		this.GetComponent(Animator).SetBool("Aiming", aiming );
		
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