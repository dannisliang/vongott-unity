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
	public var shootingDistance : float = 10;
	public var stoppingDistance : float = 2;
	public var attentionSpan : float = 10;
	public var roamingRadius : float = 10;
	
	private var animator : Animator;
	private var controller : CharacterController;
	private var prevBehaviour : OABehaviour;
	private var aiming : boolean = false;
	private var aimDegrees : float = 0;
	private var initialBehaviour : OABehaviour = OABehaviour.Idle;
	private var lastKnownPosition : Vector3;
	private var attentionTimer : float = 0;
	private var initialPosition : Vector3;
	private var initialRotation : Quaternion;
	private var roamingGoal : Vector3;

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

	public function get playerFocus () : Vector3 {
		var result : Vector3;
		
		if ( player ) {
			result = player.transform.position;

			if ( player.GetComponent.< CharacterController > () ) {
				result.y += player.GetComponent.< CharacterController > ().height / 2;
			
			} else {
				result.y += 1.8;
			
			}
		}

		return result;
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
			var there : Vector3 = playerFocus;

			if ( controller ) {
				here.y += controller.height;
			
			} else {
				here.y += 1;
			
			}
			
			var direction : Vector3 = there - here;

			if ( ( Vector3.Angle ( direction, this.transform.forward ) ) < fieldOfView / 2 ) {
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
				equippedObject.transform.localPosition = new Vector3 ( equippedObject.collider.bounds.size.z, 0, 0 );
				equippedObject.transform.localEulerAngles = new Vector3 ( 0, 90, 270 );
			
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

		health = 0;
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
					firearm.aimWithMainCamera = false;
					firearm.Fire ();
				}
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
		initialBehaviour = behaviour;
		
		var scanner : OPScanner = GameObject.FindObjectOfType.< OPScanner > ();

		initialPosition = this.transform.position;
		initialRotation = this.transform.rotation;
	}
	
	private function GetAngleBetween ( a : Vector3, b : Vector3, n : Vector3 ) : float {
    		var angle : float = Vector3.Angle ( a, b );
    		var sign : float = Mathf.Sign ( Vector3.Dot ( n, Vector3.Cross ( a, b ) ) );
    		var signed_angle : float = angle * sign;
    		var angle360 : float = ( ( signed_angle ) + 360 ) % 360;

    		return angle360;
	}

	public function DoRaycast ( target : Vector3 ) : GameObject {
		var here : Vector3 = this.transform.position + new Vector3 ( 0, 0.05, 0 );
		var there : Vector3 = target + new Vector3 ( 0, 0.05, 0 );
		
		var hit : RaycastHit;
		var distance : float = Vector3.Distance ( here, there );

		if ( Physics.Raycast ( here, there - here, hit, distance ) ) {
			if ( hit.collider.gameObject == this.gameObject ) {
				distance = Vector3.Distance ( hit.point, there );

				if ( Physics.Raycast ( hit.point, there - hit.point, hit, distance ) ) {
					return hit.collider.gameObject;
				
				} else {
					return null;

				}
			}
		
		} else {
			return null;

		}
	}

	public function Update () {
		if ( !alive ) { return; }

		var changed : boolean = behaviour != prevBehaviour;
		aiming = false;

		switch ( behaviour ) {
			case OABehaviour.ChasePlayer:
				if ( player && pathFinder ) {
					pathFinder.SetGoal ( lastKnownPosition );
				}
				
				if ( distanceToPlayer > stoppingDistance ) {
					if ( distanceToPlayer <= shootingDistance ) {
						speed = 0.5;
					
					} else {
						speed = 1;
				
					}
				
				} else {
					speed = 0;

				}

				if ( canSeePlayer ) {
					lastKnownPosition = player.transform.position;
				
					if ( isEnemy ) {
						attentionTimer = attentionSpan;
					
						if ( distanceToPlayer <= shootingDistance ) {
							ShootAtPlayer ();
							aiming = true;
						}
					}
				
				} else if ( isEnemy ) {
					if ( attentionTimer > 0 ) {
						attentionTimer -= Time.deltaTime;
					
					} else {
						behaviour = OABehaviour.RoamingRandom;
						attentionTimer = attentionSpan;
					
					}

					if ( Vector3.Distance ( this.transform.position, lastKnownPosition ) < stoppingDistance ) {
						speed = 0;
					}
				}

				break;
			
			case OABehaviour.Idle:
				var distance : float = Vector3.Distance ( this.transform.position, initialPosition );

			       	if ( distance > 0.5 ) {
					if ( pathFinder ) {
						pathFinder.SetGoal ( initialPosition );
					}

					speed = 0.5;
				
				} else {
					speed = 0;
					this.transform.rotation = Quaternion.Slerp ( this.transform.rotation, initialRotation, Time.deltaTime * turningSpeed );

				}
				
				break;

			case OABehaviour.RoamingRandom:
				speed = 0.5;
					
				if ( pathFinder ) {
					if ( roamingGoal == Vector3.zero || Vector3.Distance ( this.transform.position, roamingGoal ) < 0.5 ) {
						var roamingCenter : Vector3 = initialPosition;

						if ( isEnemy && attentionTimer > 0 ) {
							roamingCenter = lastKnownPosition;
						}
						
						roamingGoal = pathFinder.scanner.GetClosestNode ( roamingCenter + new Vector3 ( Random.Range ( 0, roamingRadius ), 0, Random.Range ( 0, roamingRadius ) ) ).position;

						pathFinder.SetGoal ( roamingGoal );
					}
					
				}

				if ( isEnemy ) {
					if ( attentionTimer > 0 ) {
						attentionTimer -= Time.deltaTime;
					
					} else if ( behaviour != initialBehaviour ) {
						behaviour = initialBehaviour;
					
					}
				}

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
				
				} else {
					behaviour = OABehaviour.RoamingRandom;
				
				}
				
				break;

		}

		if ( isEnemy && canSeePlayer ) {
			if ( behaviour != OABehaviour.ChasePlayer ) {
				behaviour = OABehaviour.ChasePlayer;
			}
		}

		if ( changed ) {
			currentPathGoal = GetNearestPathGoal ();
		}

		if ( health <= 0 ) {
			Die ();
		}

		if ( animator ) {
			animator.SetFloat ( "Speed", speed );
			animator.SetBool ( "Aiming", aiming );
			animator.SetFloat ( "AimDegrees", aimDegrees );
		}

		if ( speed > 0 && pathFinder ) {
			var goal : Vector3 = pathFinder.GetCurrentGoal ();
			
			if ( behaviour == OABehaviour.Idle && Mathf.Abs ( this.transform.position.y - initialPosition.y ) < 1 && DoRaycast ( initialPosition ) == null ) {
				goal = initialPosition;
		
			} else if ( behaviour == OABehaviour.RoamingPath && Mathf.Abs ( this.transform.position.y - pathGoals[currentPathGoal].y ) < 1 && DoRaycast ( pathGoals[currentPathGoal] ) == null ) {
				goal = pathGoals[currentPathGoal];

			}
			
			var lookPos : Vector3 = goal - this.transform.position;
			lookPos.y = 0;
			
			if ( aiming ) {
				aimDegrees = GetAngleBetween ( this.transform.forward, pathFinder.GetCurrentNode () - this.transform.position, Vector3.up );
			
			} else {
				aimDegrees = 0;
				transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( lookPos ), turningSpeed * Time.deltaTime );
			
			}
		
		} else {
			aimDegrees = 0;
		
		}

		prevBehaviour = behaviour;
	}
}
