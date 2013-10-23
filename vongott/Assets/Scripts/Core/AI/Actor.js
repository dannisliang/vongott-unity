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
		Aggressive,
		Scared
	}
	
	public enum ePathType {
		Patrolling,
		NavPoint
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
	var health : int = 100;
	var attentionSpan : float = 30.0;
	var updateFrequency : float = 5.0;
	var keepDistance : float = 10.0;
	var runningSpeed : float = 4.0;
	var walkingSpeed : float = 1.0;
	var vision : VisionCone = new VisionCone();
	var hearing : float = 10;

	var pathType : ePathType;
	var path : List.< PathNode > = new List.< PathNode >();
	var inventory : InventoryEntry[] = new InventoryEntry [4];
	
	var conversations : List.< Conversation > = new List.< Conversation >();																																							
	var target : Transform;

	var speed : float = 0.0;
	var aiming : boolean = false;
	var waiting : boolean = false;
	var talking : boolean = false;

	@HideInInspector var currentConvo : int = 0;
	@HideInInspector var currentNode : int = 0;
	@HideInInspector var nodeTimer : float = 0;
	@HideInInspector var shootTimer : float = 0;
	@HideInInspector var attentionTimer : float = 0;
	@HideInInspector var equippedItem : GameObject;
	@HideInInspector var updateTimer : float = 0;
	@HideInInspector var initPosition : Vector3;
	@HideInInspector var canShoot : boolean = false;
	@HideInInspector var firstNodeTriggered : boolean = false;
	
	@HideInInspector var pathFinder : AStarPathFinder;
			

	////////////////////
	// Init
	////////////////////
	// Awake
	function Awake () {
		if ( EditorCore.running ) {
			DestroyImmediate ( this.GetComponent ( Animator ) );
			DestroyImmediate ( this.GetComponent ( Rigidbody ) );
			DestroyImmediate ( this.GetComponent ( BoxCollider ) );
			DestroyImmediate ( this.GetComponent ( AStarPathFinder ) );			
		}
	}
	
	// Start
	function Start () {				
		pathFinder = this.GetComponent ( AStarPathFinder );
		
		initPosition = this.transform.position;
		
		if ( !EditorCore.running ) {
			this.GetComponent ( AStarPathFinder ).scanner = GameCore.scanner;
			waiting = pathType == ePathType.NavPoint;
			
		}
	}
	
	// Set affiliation
	public function SetAffiliation ( str : String ) {
		if ( str == "enemy" || str == "Enemy" ) {
			affiliation = eAffiliation.Enemy;
		} else {
			affiliation = eAffiliation.Ally;
		}
	}
	
	// Set mood
	public function SetMood ( str : String ) {
		if ( str == "aggressive" || str == "Aggressive" ) {
			mood = eMood.Aggressive;
		
		} else if ( str == "alert" || str == "Alert" ) {
			mood = eMood.Alert;
		
		} else {
			mood = eMood.Calm;
		
		}
	}
	
	// Set mood
	public function SetPathType ( str : String ) {
		if ( str == "patrolling" || str == "Patrolling" ) {
			pathType = ePathType.Patrolling;
		
		} else {
			pathType = ePathType.NavPoint;
		
		}
	}
	
	// Set vital state
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
	function CheckForcedConvo () : boolean {
		if ( conversations.Count > 0 ) { 
			return conversations[currentConvo].forced;
		} else {
			return false;
		}
	}
	
	function FindNextConvo () {
		for ( var i = 0; i < conversations.Count; i++ ) {
			var validConvo : boolean = FlagManager.GetFlag ( conversations[i].condition, conversations[i].conditionBool );
			var doneConvo : boolean = conversations[i].done;
			
			// If the convo's flag is true and it's not done yet, pick this
			if ( validConvo && !doneConvo ) {
				currentConvo = i;
				
				break;
			
			// If the convo's flag is true and it's already been done, store it in case there are no more convos
			} else if ( validConvo && doneConvo ) {
				currentConvo = i;
				
			}
		}
	}
	
	function Talk () : IEnumerator {
		if ( conversations.Count > 0 ) {
			yield WaitForEndOfFrame();
		
			GameCore.GetPlayerObject().GetComponent(Player).TalkTo ( this );
			
			conversations[currentConvo].Init ();
			
			talking = true;				
		}
	}
	
	function NextPath () {
		if ( pathType != ePathType.NavPoint ) {
			return;
		}
		
		ClearPath ();
		
		waiting = false;
		
		if ( firstNodeTriggered ) {
			currentNode++;
			
		} else {
			firstNodeTriggered = true;
		
		}
	}
	
	function StopTalking ( endAction : String ) {
		talking = false;
		
		FindNextConvo ();
		
		StartCoroutine ( GameCore.GetPlayerObject().GetComponent(Player).StopTalking () );
	
		switch ( endAction ) {
			case "Attack":
				SetAffiliation ( "Enemy" );
				SetMood ( "Aggressive" );
				break;
		
			case "NextPath":
				NextPath ();
				break;
				
			case "RunAway":
				SetAffiliation ( "Enemy" );
				SetMood ( "Scared" );
				break;
				
			case "FireTrigger":
				if ( this.GetComponent(Trigger) && this.GetComponent(Trigger).activation == Trigger.eTriggerActivation.EndConvo ) {
					this.GetComponent(Trigger).Activate();
				}
				break;
			
		} 
	}
	
	function Say ( msg : String ) {
		UIHUD.ShowTimedNotification ( msg, 2.0 );
	}
	
	function Die () {
		vitalState = eVitalState.Dead;
		
		this.GetComponent(Animator).enabled = false;
		
		GameCore.Print ( "Actor | '" + displayName + "' died" );
	}
	
	function TakeDamage ( damage : int ) {
		health -= damage;
		
		if ( health <= 0 ) {
			Die ();
		}
		
		GameCore.Print ( "Actor | Damage to '" + displayName + "': " + damage );
	}
	
	
	////////////////////
	// Equipment
	////////////////////
	function GetEquipmentAttribute ( a : eItemAttribute ) : float {
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
		shootTimer = GetEquipmentAttribute ( eItemAttribute.FireRate );
	}
	
	function Shooting () {						
		if ( equippedItem && shootTimer >= GetEquipmentAttribute ( eItemAttribute.FireRate ) ) {
			shootTimer = 0;
		
			var shootTarget : Vector3;
		
			if ( target.GetComponent ( Player ) ) {
				shootTarget = target.GetComponent ( Player ).torso.transform.position;
			} else if ( target.GetComponent ( Actor ) ) {
				shootTarget = target.GetComponent ( Actor ).torso.position;
			}
		
			var accuracyDecimal : float = 1.0 - ( GetEquipmentAttribute ( eItemAttribute.Accuracy ) / 100 );
			var accuracyDegree : float = Random.Range ( -accuracyDecimal, accuracyDecimal );
		
			shootTarget += Vector3.one * accuracyDegree;
		
			DamageManager.GetInstance().SpawnBullet ( equippedItem, shootTarget, this.gameObject );
		
			// Muzzle flash
			if ( equippedItem.transform.GetChild(0) ) {
				equippedItem.transform.GetChild(0).gameObject.SetActive ( true );
			}
		
			speed = 0;
			aiming = true;
		}		
	}
	
	////////////////////
	// Path finding
	////////////////////
	function FindPath ( v : Vector3 ) {
		pathFinder.SetGoal ( v );
	}
		
	function ClearPath () {
		if ( this.GetComponent ( AStarPathFinder ).nodes.Count > 0 ) {
			this.GetComponent ( AStarPathFinder ).ClearNodes ();
		}
	}	
	
	function StartChase ( t : Transform ) {
		if ( t ) {
			SetMood ( "Aggressive" );
			
			target = t;
			
			if ( inventory[0] ) {
				Equip ( inventory[0] );
			}
						
			Say ( "Hey! You!" );
		
		} else {
			ClearPath ();
			
		}
	}
	
	function TurnTo ( dir : Vector3 ) {
		if ( dir == Vector3.zero ) { return; }
		
		var lookPos : Vector3 = dir;
		lookPos.y = 0;
		
		transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), 4 * Time.deltaTime );
	}
	
	function TurnTowards ( pos : Vector3 ) {
		TurnTo ( pos - transform.position );
	}
	
	function RunForward () {			
		speed = Mathf.Lerp ( speed, runningSpeed, Time.deltaTime * 5 );
	}
	
	function WalkForward () {			
		speed = Mathf.Lerp ( walkingSpeed, 1.0, Time.deltaTime * 5 );
	}
	
	function Roaming () {
		// Conversation
		if ( talking ) {
			TurnTowards ( GameCore.GetPlayerObject().transform.position );
			speed = 0;
		
		// Waiting
		} else if ( waiting ) {
			speed = 0;
		
		// Patrolling
		} else if ( pathType == ePathType.Patrolling && path.Count > 0 ) {
			if ( Vector3.Distance ( transform.position, path[currentNode].position ) < 0.1 ) {
				nodeTimer = path[currentNode].duration;
								
				if ( currentNode < path.Count - 1 ) {
					currentNode++;
				} else if ( pathType == ePathType.Patrolling ) {
					currentNode = 0;
				} else {
					waiting = true;
					return;
				}
			
				speed = 0;
			}
			
			if ( nodeTimer <= 0 ) {
				TurnTowards ( path[currentNode].position );
				WalkForward ();
				
			} else {
				nodeTimer -= Time.deltaTime;
			
			}	
		
		// Go to navpoint
		} else if ( pathType == ePathType.NavPoint && path.Count > 0 && currentNode < path.Count ) {
			if ( Vector3.Distance ( transform.position, path[currentNode].position ) < 0.5 ) {
				waiting = true;
				ClearPath();
			
			} else if ( pathFinder.nodes.Count > 0 ) {
				if ( this.GetComponent(LocalAvoidance) && this.GetComponent(LocalAvoidance).detecting ) {
					TurnTo ( this.GetComponent(LocalAvoidance).targetDirection );
				} else {
					TurnTowards ( ( pathFinder.nodes[pathFinder.currentNode] as AStarNode ).position );
				}
										
				if ( path[currentNode].running ) {
					RunForward ();
				
				} else {
					WalkForward ();
				
				}
												
			} else {
				FindPath ( path[currentNode].position );
			
			}
		}
	}
	
	function Approaching ( t : Transform ) {
		ClearPath ();
		
		if ( ( transform.position - t.position ).magnitude > keepDistance ) {
			TurnTowards ( t.position );		
			RunForward ();
		
		} else {
			TurnTowards ( t.position );
			speed = 0.0;
			
		}
		
		canShoot = ( transform.position - t.position ).magnitude < keepDistance * 2;
	}
	
	function GiveUp () {
		SetMood ( "Alert" );
		
		FindPath ( initPosition );
		
		UnEquip ();
		
		Say ( "Bah! Whatever, man." );
	}
	
	
	/////////////////////
	// Update
	/////////////////////
	// Trigger
	function OnTriggerEnter ( other : Collider ) {
		if ( other.GetComponent ( InteractiveObject ) ) {
			other.GetComponent ( InteractiveObject ).NPCCollide ( this );
		}
	}
	
	// Interact
	override function InvokePrompt () {
		// check for interaction
		if ( GameCore.controlsActive ) {
			if ( affiliation == eAffiliation.Ally && !talking  ) {
				if ( CheckForcedConvo() ) {
					StartCoroutine ( Talk() );
				}
			}
		}
	}
	
	override function Interact () {
		if ( GameCore.controlsActive && Input.GetMouseButtonDown(0) && !talking ) {
			StartCoroutine ( Talk() );
			UIHUD.ShowNotification ( "" );
		}
	}
	
	// Game loop
	function Update () {
		if ( vitalState != eVitalState.Alive ) {
			if ( !this.gameObject.GetComponent ( LiftableItem ) ) {
				this.gameObject.AddComponent ( LiftableItem );
			}
			return;
		}
		
		if ( !inventory ) { inventory = new InventoryEntry [4]; }
		
		if ( !GameCore.started ) { return; }
				
		var forward = transform.TransformDirection (Vector3.forward);
				
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
				
				Roaming ();
			
			}
			
			// Reset timers
			attentionTimer = 0;
			updateTimer = updateFrequency;
		
		// ^ The player is out of sight and the actor is an enemy
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
					RunForward ();
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
		
		// ^ the player is out if sight and the actor is an ally
		} else {
			Roaming ();
			
		}
		
		// Shoot timer
		if ( equippedItem && shootTimer < GetEquipmentAttribute ( eItemAttribute.FireRate ) ) {
			shootTimer += Time.deltaTime;			
		}
		
		this.GetComponent(Animator).SetFloat("Speed", speed / runningSpeed );
		this.GetComponent(Animator).SetBool("Aiming", aiming );
	}
}