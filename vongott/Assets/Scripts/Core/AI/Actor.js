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
	
	var currentConvoRoot : int = 0;
	var conversationTree : String;																																							
	
	var target : Transform;
	var goal : Vector3;

	var speed : float = 0.0;
	var aiming : boolean = false;
	var waiting : boolean = false;
	var talking : boolean = false;

	@HideInInspector var currentNode : int = 0;
	@HideInInspector var nodeTimer : float = 0;
	@HideInInspector var shootTimer : float = 0;
	@HideInInspector var attentionTimer : float = 0;
	@HideInInspector var equippedItem : GameObject;
	@HideInInspector var updateTimer : float = 0;
	@HideInInspector var initPosition : Vector3;
	@HideInInspector var canShoot : boolean = false;
	@HideInInspector var firstNodeTriggered : boolean = false;
	
	@HideInInspector var pathFinder : OPPathFinder;
			

	////////////////////
	// Init
	////////////////////
	// Awake
	function Awake () {
		if ( EditorCore.running ) {
			MakeRagdoll ( false );
			
			DestroyImmediate ( this.GetComponent ( Animator ) );
			DestroyImmediate ( this.GetComponent ( Rigidbody ) );
			DestroyImmediate ( this.GetComponent ( BoxCollider ) );
			DestroyImmediate ( this.GetComponent ( OPPathFinder ) );			
		}
	}
	
	// Start
	function Start () {				
		pathFinder = this.GetComponent ( OPPathFinder );
		
		initPosition = this.transform.position;
		
		if ( !EditorCore.running ) {
			this.GetComponent ( OPPathFinder ).scanner = GameCore.scanner;
			waiting = pathType == ePathType.NavPoint;
			
			MakeRagdoll ( false );
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
	
	// Set path type
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
	function Talk () : IEnumerator {
		if ( !String.IsNullOrEmpty ( conversationTree ) ) {
			yield WaitForEndOfFrame();
			talking = true;				
		
			ConversationManager.StartConversation ( this );
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
			
		} 
	}
	
	function Say ( msg : String ) {
		UIHUD.ShowTimedNotification ( msg, 2.0 );
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
				shootTarget = target.GetComponent ( Player ).head.position;
			} else if ( target.GetComponent ( Actor ) ) {
				shootTarget = target.GetComponent ( Actor ).head.position;
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
	function InSight ( v : Vector3 ) : boolean {
		return !Physics.Linecast ( head.position, v + new Vector3 ( 0, 0.5, 0 ), vision.layerMask );
	}
	
	function FindPath ( v : Vector3 ) {
		goal = v;
		pathFinder.SetGoal ( goal );
	}
		
	function ClearPath () {
		if ( this.GetComponent ( OPPathFinder ).nodes.Count > 0 ) {
			this.GetComponent ( OPPathFinder ).ClearNodes ();
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
			if ( Vector3.Distance ( transform.position, path[currentNode].position ) < 0.5 ) {
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
		
		// Direct target
		} else if ( InSight ( goal ) ) {
			if ( Vector3.Distance ( transform.position, goal ) < 1.0 ) {
				waiting = true;
				ClearPath();
			
			} else {
				TurnTowards ( goal );
				WalkForward ();
			
			}
		
		// Go to navpoint
		} else if ( pathType == ePathType.NavPoint && path.Count > 0 && currentNode < path.Count ) {
			if ( Vector3.Distance ( transform.position, path[currentNode].position ) < 1.0 ) {
				waiting = true;
				ClearPath();
			
			} else if ( pathFinder.nodes.Count > 0 ) {
				if ( this.GetComponent(LocalAvoidance) && this.GetComponent(LocalAvoidance).detecting ) {
					TurnTo ( this.GetComponent(LocalAvoidance).targetDirection );
				
				} else {
					TurnTowards ( ( pathFinder.nodes[pathFinder.currentNode] as OPNode ).position );
				
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
	// Death
	/////////////////////
	function Die () {
		vitalState = eVitalState.Dead;
		
		this.GetComponent(Animator).enabled = false;
		
		MakeRagdoll ( true );

		GameCore.Print ( "Actor | '" + displayName + "' died" );
	}

	public function GetLimbColliders () : Collider[] {
		return this.GetComponentsInChildren.< Collider > ();
	}

	public function MakeRagdoll ( useRagdoll : boolean ) {
		var mainCollider : CapsuleCollider = this.GetComponent ( CapsuleCollider );
		var mainRigidbody : Rigidbody = this.GetComponent ( Rigidbody );
		var allColliders : Collider[] = this.GetComponentsInChildren.< Collider > ();
		var allRigidbodies : Rigidbody[] = this.GetComponentsInChildren.< Rigidbody > ();
		var i : int = 0;

		mainCollider.enabled = !useRagdoll;
		if ( mainRigidbody != null ) {
			mainRigidbody.isKinematic = useRagdoll;
		}

		for ( i = 0; i < allColliders.Length; i++ ) {
			if ( allColliders[i] != mainCollider ) {	
				allColliders[i].enabled = useRagdoll;
			}
		}	
		
		for ( i = 0; i < allRigidbodies.Length; i++ ) {
			if ( allRigidbodies[i] != mainRigidbody ) {	
				allRigidbodies[i].isKinematic = !useRagdoll;
			}
		}	
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
				if ( ConversationManager.CheckForcedConvo( this ) ) {
					Interact();
				}
			}
		}
	}
	
	override function Interact () {
		if ( GameCore.controlsActive && !talking ) {
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
		
		if ( !GameCore.running ) { return; }
				
		var forward = transform.TransformDirection (Vector3.forward);
				
		// Detect player
		var here : Vector3 = head.position;
		var there : Vector3 = GameCore.GetPlayerObject().GetComponent(Player).head.transform.position;
		var direction : Vector3 = there - here;
		var angle : float = Vector3.Angle ( forward, direction );
		var distance : float = direction.magnitude;
		var hit : RaycastHit;
		
		var inSight : boolean = angle < vision.angle && Physics.Raycast ( here, direction, hit, vision.distance, vision.layerMask ) && hit.collider.gameObject == GameCore.GetPlayerObject();
		var inEarshot : boolean = distance < hearing && PlayerController.deltaCombined > 0.5;
		
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
					TurnTowards ( ( pathFinder.nodes[pathFinder.currentNode] as OPNode ).position );
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
