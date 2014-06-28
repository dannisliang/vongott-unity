#pragma strict

public enum OABehaviour {
	ChasePlayer,
	Idle,
	RoamingPath,
	RoamingRandom,
	SearchForPlayer,
	GoToGoal,
}

public class OACharacter extends MonoBehaviour {
	public var isEnemy : boolean = false;
	public var destroyOnDeath : boolean = false;
	public var player : GameObject;
	public var health : float = 100;
	public var behaviour : OABehaviour = OABehaviour.Idle;
	public var speed : float = 0;
	public var fieldOfView : float = 130;
	public var lineOfSight : float = 20;
	private var animator : Animator;
	private var controller : CharacterController;
	private var prevBehaviour : OABehaviour;
	private var aiming : boolean = false;

	// Inventory
	public var inventory : OSInventory;
	public var usingWeapons : boolean = true;
	public var weaponCategoryPreference : int = 0;
	public var weaponSubcategoryPreference : int = 0;
	public var equippingHand : Transform;
	private var equippedObject : OSItem;
	
	// Conversation
	public var conversationTreePath : String = "";
	public var conversationTree : OCTree;
	public var convoSpeakerObjects : GameObject [] = new GameObject [0];
	public var convoRootNode : int = 0;

	// Path
	public var pathFinder : OPPathFinder;
	public var pathGoals : Vector3 [] = new Vector3[0];
	public var turningSpeed : float = 4;
	public var updatePathInterval : float = 10;
	public var stoppingDistance : float = 2;
	private var updatePathTimer : float = 0;
	private var currentPathGoal : int = -1;

	public function get preferredWeapon () : OSItem {
		if ( inventory && inventory.definitions ) {
			var cat : OSCategory = inventory.definitions.categories[weaponCategoryPreference];
			var subcat : String = cat.subcategories[weaponSubcategoryPreference];
			
			return inventory.FindItemByCategory ( cat.id, subcat );
		
		} else {
			return null;
		
		}
	}

	public function set running ( value : boolean ) {
		if ( !value ) {
			if ( speed > 0 ) {
				speed = 0.25;
			}
		
		} else {
			if ( speed > 0 ) {
				speed = 0.75;
			}

		}
	}

	public function get running () : boolean {
		return speed >= 0.5;
	}

	public function get alive () : boolean { 
		return health > 0;
	}

	public function get convoSpeakers () : GameObject [] {
		if ( conversationTree ) {
			if ( convoSpeakerObjects.Length != conversationTree.speakers.Length ) {
				convoSpeakerObjects = new GameObject [conversationTree.speakers.Length];
			}

			return convoSpeakerObjects;
		}
		
		return null;
	}

	public function get distanceToPlayer () : float {
		if ( player ) {
			return Vector3.Distance ( this.transform.position, player.transform.position );

		} else {
			return Mathf.Infinity;

		}
	}

	public function get canSeePlayer () : boolean {
		if ( player ) {
			var hit : RaycastHit;
			var here : Vector3 = this.transform.position;
			var there : Vector3 = player.transform.position;

			if ( controller ) {
				here.y += controller.height;
			
			} else {
				here.y += 1;
			
			}
			
			if ( player.GetComponent.< CharacterController > () ) {
				there.y += player.GetComponent.< CharacterController > ().height / 2;
			
			} else {
				there.y += 1;
			
			}


			var direction : Vector3 = there - here;

			if ( ( Vector3.Angle ( direction, this.transform.forward ) ) < fieldOfView ) {
				if ( Physics.Raycast ( here, direction, hit, lineOfSight ) ) {
					if ( hit.transform == player.transform ) {
						Debug.DrawLine ( here, hit.point );
						return true;
					
					} else {
						return false;

					}
				}
			}

		}

		return false;
	}

	public function GetNearestPathGoal () : int {
		var nearest : float = Mathf.Infinity;
		var result : int = 0;

		for ( var i : int = 0; i < pathGoals.Length; i++ ) {
			var dist : float = Vector3.Distance ( this.transform.position, pathGoals[i] );

			if ( dist < nearest ) {
				nearest = dist;
				result = i;
			}
		}

		return result;
	}

	public function TeleportToNextPathGoal () {
		if ( currentPathGoal + 1 < pathGoals.Length ) {
			currentPathGoal++;
		} else {
			currentPathGoal = 0;
		}

		this.transform.position = pathGoals [ currentPathGoal ];

		behaviour = OABehaviour.Idle;
		speed = 0;
	}

	public function NextPathGoal () {
		if ( currentPathGoal + 1 < pathGoals.Length ) {
			currentPathGoal++;
		} else {
			currentPathGoal = 0;
		}

		behaviour = OABehaviour.GoToGoal;
		speed = 0.25;
	}
	
	public function NextPathGoalRun () {
		if ( currentPathGoal + 1 < pathGoals.Length ) {
			currentPathGoal++;
		} else {
			currentPathGoal = 0;
		}

		behaviour = OABehaviour.GoToGoal;
		speed = 1;
	}

	public function TakeDamage ( damage : float ) {
		health -= damage;

		if ( health <= 0 ) {
			Die ();
		}
	}

	public function OnProjectileHit ( damage : float ) {
		TakeDamage ( damage );
	}

	public function EquipPreferredWeapon () {
		if ( preferredWeapon ) {
			if ( equippedObject ) {
				Destroy ( equippedObject );
			}

			equippedObject = Instantiate ( preferredWeapon ) as OSItem;

			if ( equippedObject ) {
				equippedObject.transform.parent = equippingHand;
				equippedObject.transform.localPosition = Vector3.zero;
				equippedObject.transform.localEulerAngles = Vector3.zero;
			
				if ( equippedObject.rigidbody ) {
					Destroy ( equippedObject.rigidbody ) ;
				}

				if ( equippedObject.collider ) {
					equippedObject.collider.enabled = false;
				}
			}
		}
	}

	public function Unequip () {
		if ( equippedObject ) {
			Destroy ( equippedObject );
		}
	}

	public function Die () {
		if ( destroyOnDeath ) {
			Destroy ( this.gameObject );
		
		} else {
			SetRagdoll ( true );
		
		}
	}

	public function SetRagdoll ( state : boolean ) {
		for ( var c : Collider in this.GetComponentsInChildren.< Collider > () ) {
			c.enabled = state;

			if ( c.rigidbody ) {
				c.rigidbody.isKinematic = !state;
			}
		}

		if ( controller ) {
			controller.enabled = !state;
		}

		if ( animator ) {
			animator.enabled = !state;
		}
	}

	function TurnTowards ( v : Vector3 ) {
		var lookPos : Vector3 = v - transform.position;
		lookPos.y = 0;
		
		this.transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation ( lookPos ), turningSpeed * Time.deltaTime );
	}
	
	public function ShootAtPlayer () {
		if ( usingWeapons ) {
			if ( !equippedObject ) {
				EquipPreferredWeapon ();

			} else {
				var firearm : OSFirearm = equippedObject.GetComponent.< OSFirearm > ();
				
				if ( firearm ) {
					firearm.Fire ();
				}
			
				firearm.transform.rotation = equippingHand.rotation;
			}
		}

		TurnTowards ( player.transform.position );
	}

	public function UpdateSpeakers () {
		if ( conversationTree ) {
			conversationTree.currentRoot = convoRootNode;
		}
	}

	public function Start () {
		UpdateSpeakers ();
		animator = this.GetComponent.< Animator > ();
		controller = this.GetComponent.< CharacterController > ();

		SetRagdoll ( !alive );
	}

	public function Update () {
		if ( !alive ) { return; }

		var changed : boolean = behaviour != prevBehaviour;
		aiming = false;

		switch ( behaviour ) {
			case OABehaviour.ChasePlayer:
				if ( player && pathFinder && updatePathTimer <= 0 ) {
					pathFinder.SetGoal ( player.transform.position );
				}
				
				if ( Vector3.Distance ( this.transform.position, player.transform.position ) > stoppingDistance ) {
					speed = 1;
				
				} else {
					speed = 0;
				
				}

				if ( isEnemy && canSeePlayer && distanceToPlayer <= stoppingDistance ) {
					ShootAtPlayer ();
					aiming = true;
				}

				break;
			
			case OABehaviour.Idle:
				speed = 0;
				break;

			case OABehaviour.RoamingPath:
				if ( currentPathGoal >= 0 && currentPathGoal < pathGoals.Length && pathFinder ) {
					if ( Vector3.Distance ( this.transform.position, pathGoals[currentPathGoal] ) < 0.5 ) {
						if ( currentPathGoal < pathGoals.Length - 1 ) {
							currentPathGoal++;
						
						} else {
							currentPathGoal = 0;

						}	

					} else {
						pathFinder.SetGoal ( pathGoals[currentPathGoal] );
					
					}
				}
				speed = 0.25;
				break;

			case OABehaviour.GoToGoal:
				if ( pathGoals.Length > 0 && pathFinder ) {
					if ( Vector3.Distance ( this.transform.position, pathGoals[currentPathGoal] ) < 0.5 ) {
						behaviour = OABehaviour.Idle;

					} else {
						pathFinder.SetGoal ( pathGoals[currentPathGoal] );
				
					}
				}
				break;

		}

		if ( changed ) {
			currentPathGoal = GetNearestPathGoal ();
			updatePathTimer = 0;

		} else if ( updatePathTimer > 0 ) {
			updatePathTimer -= Time.deltaTime;
		
		} else {
			updatePathTimer = updatePathInterval;

		}

		if ( health <= 0 ) {
			Die ();
		}

		if ( animator ) {
			animator.SetFloat ( "Speed", speed );
			animator.SetBool ( "Aiming", aiming );
		}

		if ( speed > 0 && pathFinder ) {
			var lookPos : Vector3 = pathFinder.GetCurrentGoal() - this.transform.position;
			lookPos.y = 0;
			
			transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), turningSpeed * Time.deltaTime );
		}

		prevBehaviour = behaviour;
	}
}
