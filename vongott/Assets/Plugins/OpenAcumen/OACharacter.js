#pragma strict

public enum OABehaviour {
	ChasingTarget,
	Idle,
	Patrolling,
	Seeking,
	GoToGoal,
	GoHome,
	Talking,
	Fleeing,
}

public class OACharacter extends MonoBehaviour {
	public var stats : OSStats;
	public var skillTree : OSSkillTree;
	public var attackTarget : boolean = false;
	public var unconcious : boolean = false;
	public var destroyOnDeath : boolean = false;
	public var hasInfiniteAmmo : boolean = true;
	public var team : int = 1;
	public var target : GameObject;
	public var targetTag : String = "Player";
	public var behaviour : OABehaviour = OABehaviour.Idle;
	public var speed : float = 0;
	public var fieldOfView : float = 130;
	public var lineOfSight : float = 20;
	public var shootingDistance : float = 10;
	public var stoppingDistance : float = 2;
	public var attentionSpan : float = 10;
	public var roamingRadius : float = 10;
	public var earshotRadius : float = 10;
	public var hesitation : float = 2;
	
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
	private var seekingGoal : Vector3;
	private var hesitationTimer : float = 0;

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
	public var convoFacing : int = 0;
	public var convoRootNode : int = 0;

	// Path
	public var pathFinder : OPPathFinder;
	public var pathGoals : Vector3 [] = new Vector3[0];
	public var turningSpeed : float = 4;
	
	private var currentPathGoal : int = -1;

	public function get facingObject () : GameObject {
		if ( convoFacing < convoSpeakerObjects.Length ) {
			return convoSpeakerObjects [ convoFacing ];
		}

		return null;
	}

	public function get inConversation () : boolean {
		return behaviour == OABehaviour.Talking;
	}

	public function set inConversation ( value : boolean ) {
		behaviour = OABehaviour.Talking;
	}

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
		return stats.hp > 0;
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

	public function get targetFocus () : Vector3 {
		var result : Vector3;
		
		if ( target ) {
			result = target.transform.position;

			if ( target.GetComponent.< CharacterController > () ) {
				result.y += target.GetComponent.< CharacterController > ().height / 2;
			
			} else {
				result.y += 1.8;
			
			}
		}

		return result;
	}
	
	public function get distanceToTarget () : float {
		if ( target ) {
			return Vector3.Distance ( this.transform.position, target.transform.position );

		} else {
			return Mathf.Infinity;

		}
	}

	public function get canSeeTarget () : boolean {
		if ( target ) {
			var hit : RaycastHit;
			var here : Vector3 = this.transform.position;
			var there : Vector3 = targetFocus;

			if ( controller ) {
				here.y += controller.height;
			
			} else {
				here.y += 1;
			
			}
			
			var direction : Vector3 = there - here;

			if ( ( Vector3.Angle ( direction, this.transform.forward ) ) < fieldOfView / 2 ) {
				if ( Physics.Raycast ( here, direction, hit, lineOfSight ) ) {
					if ( hit.transform == target.transform ) {
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

		NewInitialPosition ();
	}

	public function NextPathGoal () {
		if ( currentPathGoal < pathGoals.Length - 1 ) {
			currentPathGoal++;
		} else {
			currentPathGoal = 0;
		}

		behaviour = OABehaviour.GoToGoal;
	}
	
	public function NextPathGoalRun () {
		if ( currentPathGoal < pathGoals.Length - 1 ) {
			currentPathGoal++;
		} else {
			currentPathGoal = 0;
		}

		behaviour = OABehaviour.GoToGoal;
	}

	public function GiveHP ( points : float ) {
		stats.hp = Mathf.Clamp ( 0, stats.maxHp, stats.hp + points );
	}

	public function TakeDamage ( damage : float ) {
		stats.hp -= damage;

		if ( stats.hp <= 0 ) {
			Die ();
		}
		
		if ( DoRaycast ( target.transform.position ) == null && behaviour != OABehaviour.ChasingTarget ) {
			DetectTarget ();
			AlertNeighbors ();
		}	
	}

	public function NewInitialPosition () {
		initialPosition = this.transform.position;
		initialRotation = this.transform.rotation;
	}
	
	public function OnMeleeHit ( melee : OSMelee ) {
		if ( melee.wielder == this.gameObject ) {
			return;
		}
		
		if ( target != melee.wielder ) {
			target = melee.wielder;
		}

		TakeDamage ( melee.damage );
	}
		
	public function OnProjectileHit ( firearm : OSFirearm ) {
		if ( firearm.wielder == this.gameObject ) {
			return;
		}
		
		if ( target != firearm.wielder ) {
			target = firearm.wielder;
		}

		TakeDamage ( firearm.damage );
	}

	public function OnConversationEnd () {
		if ( behaviour == OABehaviour.Talking ) {
			behaviour = initialBehaviour;
		}
	}

	public function PositionEquippedObject () {
		if ( equippedObject.rigidbody ) {
			equippedObject.rigidbody.isKinematic = true;
		}

		var offset : Vector3;

		if ( equippedObject.collider ) {
			offset = equippedObject.collider.bounds.size;

			equippedObject.collider.enabled = true;
		}

		equippedObject.transform.parent = equippingHand;
		equippedObject.transform.localPosition = new Vector3 ( offset.z, 0, 0 );
		equippedObject.transform.localEulerAngles = new Vector3 ( 0, 90, 270 );
	}

	public function EquipPreferredWeapon () {
		if ( usingWeapons && preferredWeapon ) {
			if ( equippedObject ) {
				if ( equippedObject.prefabPath == preferredWeapon.prefabPath ) {
					return;
				
				} else {
					Destroy ( equippedObject );
					equippedObject = null;
				
				}
			}

			equippedObject = Instantiate ( preferredWeapon ) as OSItem;

			if ( equippedObject ) {
				PositionEquippedObject ();

				var firearm : OSFirearm = equippedObject.GetComponent.< OSFirearm > ();

				if ( firearm ) {
					firearm.wielder = this.gameObject;
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

		stats.hp = 0;

		if ( equippedObject ) {
			equippedObject.transform.parent = this.transform.parent;
		
			if ( equippedObject.collider ) {
				equippedObject.collider.enabled = true;
			}

			if ( equippedObject.rigidbody ) {
				equippedObject.rigidbody.isKinematic = false;
				equippedObject.rigidbody.useGravity = true;
			}
		}
	}

	public function KnockUnconcious () {
		SetRagdoll ( true );
		unconcious = true;
	}

	public function WakeUp () {
		if ( stats.hp > 0 ) {
			unconcious = false;
			SetRagdoll ( false );
		}
	}

	public function SetRagdoll ( state : boolean ) {
		var characterControllers : CharacterController[] = this.transform.root.GetComponentsInChildren.< CharacterController > ();
		
		for ( var c : Collider in this.GetComponentsInChildren.< Collider > () ) {
			c.enabled = state;

			if ( c.rigidbody ) {
				c.rigidbody.isKinematic = !state;
			}

			if ( c.enabled ) {
				for ( var cc : CharacterController in this.transform.root.GetComponentsInChildren.< CharacterController > () ) {
					if ( cc.collider && cc.collider != c && cc.collider.enabled && c.enabled ) {
						Physics.IgnoreCollision ( c, cc.collider );
					}
				}
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
	
	public function ShootAtTarget () {
		if ( usingWeapons ) {
			if ( !equippedObject ) {
				EquipPreferredWeapon ();

			} else {
				var firearm : OSFirearm = equippedObject.GetComponent.< OSFirearm > ();
				var melee : OSMelee = equippedObject.GetComponent.< OSMelee > ();

				if ( firearm ) {
					firearm.aimWithMainCamera = false;
					firearm.Fire ();
				}
				
				if ( melee ) {
					melee.aimWithMainCamera = false;
					melee.Fire ();
				}

				if ( hasInfiniteAmmo ) {
					equippedObject.ammunition.value = equippedObject.ammunition.max;
				
				} else if ( equippedObject.ammunition.value <= 0 ) {
					behaviour = OABehaviour.Fleeing;
					attentionTimer = attentionSpan;

				}
			}
		}

		TurnTowards ( target.transform.position );
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
		stats = this.GetComponent.< OSStats > ();
		
		SetRagdoll ( !alive );
		initialBehaviour = behaviour;
		
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

	public function AlertNeighbors () {
		var radius : float = earshotRadius;
		var characters : OACharacter[] = this.transform.root.GetComponentsInChildren.< OACharacter > ();

		for ( var a : OACharacter in characters ) {
			var distance : float = Vector3.Distance ( a.transform.position, this.transform.position ); 

			if ( a != this && distance <= radius && a.team == team ) {
				a.DetectTarget ( target );
			}
		}
	}

	public function DetectTarget ( newTarget : GameObject ) {
		if ( target == newTarget && behaviour == OABehaviour.ChasingTarget ) { return; }
		
		target = newTarget;

		DetectTarget ();
	}

	public function DetectTarget () {
		if ( usingWeapons ) {
			attackTarget = true;
			behaviour = OABehaviour.ChasingTarget;
			hesitationTimer = hesitation;
	
		} else {
			behaviour = OABehaviour.Fleeing;
			attentionTimer = attentionSpan;

		}
	}

	public function Update () {
		if ( !alive || unconcious ) { return; }

		var changed : boolean = behaviour != prevBehaviour;
		aiming = false;
		
		// Workaround for equipped item disappearance
		if ( equippedObject && equippedObject.transform.parent != equippingHand ) {
			PositionEquippedObject ();
		}

		switch ( behaviour ) {
			case OABehaviour.ChasingTarget:
				if ( !usingWeapons ) {
					behaviour = OABehaviour.Fleeing;
					attentionTimer = attentionSpan;
					break;
				}
				
				if ( !target ) {
					behaviour = OABehaviour.Idle;
					break;
				}
				
				if ( distanceToTarget > stoppingDistance ) {
					if ( distanceToTarget <= shootingDistance ) {
						speed = 0.5;
					
					} else {
						speed = 1;
				
					}
				
				} else {
					speed = 0;

				}

				var targetStats : OSStats = target.GetComponent.< OSStats > ();

				if ( targetStats && targetStats.hp <= 0 ) {
					behaviour = OABehaviour.Seeking;
					attentionTimer = attentionTimer + attentionSpan;

				} else if ( canSeeTarget || distanceToTarget <= shootingDistance ) {
					lastKnownPosition = target.transform.position;
					pathFinder.SetGoal ( lastKnownPosition );
				
					if ( attackTarget ) {
						attentionTimer = attentionSpan;
					
						if ( hesitationTimer <= 0 && distanceToTarget <= shootingDistance ) {
							ShootAtTarget ();
							aiming = true;
						}
					}
				
				} else {
					if ( pathFinder.hasPath && pathFinder.atEndOfPath ) {
					       	speed = 0;
					}
					
					if ( attackTarget ) {
						if ( attentionTimer <= 0 ) {
							hesitationTimer = hesitation;
							
							behaviour = OABehaviour.Seeking;
							attentionTimer = attentionTimer + attentionSpan;
						
						} else if ( attentionTimer > 0 ) {
							attentionTimer -= Time.deltaTime;

						}
					}
				}

				break;
			
			case OABehaviour.GoHome:
				speed = 0.5;

				if ( equippedObject ) {
					Unequip ();
				}

				if ( pathFinder.hasPath && pathFinder.atEndOfPath ) {
					behaviour = initialBehaviour;
					
					if ( behaviour == OABehaviour.Patrolling ) {
						currentPathGoal = 0;
					}
				}	

				break;

			case OABehaviour.Idle:
				speed = 0;
				
				if ( equippedObject ) {
					Unequip ();
				}
				
				this.transform.rotation = Quaternion.Slerp ( this.transform.rotation, initialRotation, Time.deltaTime * turningSpeed );

				break;

			case OABehaviour.Talking:
				speed = 0;
			
				if ( convoSpeakerObjects.Length > convoFacing && convoSpeakerObjects [ convoFacing ] ) {
					TurnTowards ( convoSpeakerObjects [ convoFacing ].transform.position );
				}

				break;

			case OABehaviour.Fleeing:
				speed = 1.0;

				if ( pathFinder.atEndOfPath ) {
					seekingGoal = this.transform.position + new Vector3 ( Random.Range ( -roamingRadius, roamingRadius ), 0, Random.Range ( -roamingRadius, roamingRadius ) );

					pathFinder.SetGoal ( seekingGoal );
				}
				
				if ( attentionTimer > 0 ) {
					attentionTimer -= Time.deltaTime;
				
				} else {
					behaviour = OABehaviour.GoHome;
					pathFinder.SetGoal ( initialPosition, true );
					hesitationTimer = hesitation;
				
				}

				break;

			case OABehaviour.Seeking:
				speed = 0.5;
				
				if ( pathFinder.atEndOfPath ) {
					seekingGoal = lastKnownPosition + new Vector3 ( Random.Range ( -roamingRadius, roamingRadius ), 0, Random.Range ( -roamingRadius, roamingRadius ) );

					pathFinder.SetGoal ( seekingGoal );
					
					hesitationTimer = hesitation;
				}
					
				if ( attentionTimer > 0 ) {
					attentionTimer -= Time.deltaTime;
				
				} else {
					behaviour = OABehaviour.GoHome;
					pathFinder.SetGoal ( initialPosition, true );
					hesitationTimer = hesitation;
				
				}

				break;

			case OABehaviour.Patrolling:
				if ( currentPathGoal >= 0 && currentPathGoal < pathGoals.Length && pathFinder ) {
					if ( Vector3.Distance ( this.transform.position, pathGoals[currentPathGoal] ) < 0.5 ) {
						if ( currentPathGoal < pathGoals.Length - 1 ) {
							currentPathGoal++;
						
						} else {
							currentPathGoal = 0;

						}	
				
						hesitationTimer = hesitation;

					} else {
						pathFinder.SetGoal ( pathGoals[currentPathGoal] );
					
					}
				}
				speed = 0.5;
				break;

			case OABehaviour.GoToGoal:
				speed = 0.5;
				
				if ( pathGoals.Length > 0 ) {
					if ( pathFinder.hasPath && pathFinder.atEndOfPath ) {
						NewInitialPosition ();
						behaviour = OABehaviour.Idle;

					} else {
						pathFinder.SetGoal ( pathGoals[currentPathGoal] );
				
					}
				
				} else {
					behaviour = OABehaviour.Idle;
				
				}
				
				break;

		}

		if ( attackTarget && canSeeTarget && usingWeapons ) {
			if ( behaviour != OABehaviour.ChasingTarget ) {
				DetectTarget ();
				AlertNeighbors ();
			}
		}

		if ( changed ) {
			currentPathGoal = GetNearestPathGoal ();
		}

		if ( stats.hp <= 0 ) {
			Die ();
		}

		if ( hesitationTimer > 0 ) {
			hesitationTimer -= Time.deltaTime;
			speed = 0;
		}

		// If there is no path, stop moving
		if ( !pathFinder.hasPath ) {
			speed = 0;
		}

		if ( animator ) {
			animator.SetFloat ( "Speed", speed );
			animator.SetBool ( "Aiming", aiming );
			animator.SetFloat ( "AimDegrees", aimDegrees );
		}
		
		if ( !target && !String.IsNullOrEmpty ( targetTag ) ) {
			target = GameObject.FindWithTag ( targetTag );
		}

		if ( speed > 0 ) {
			var goal : Vector3 = pathFinder.GetCurrentNode ();
		
			// Override immediate goal	
			if ( ( behaviour == OABehaviour.Patrolling || behaviour == OABehaviour.GoToGoal ) && Mathf.Abs ( this.transform.position.y - pathGoals[currentPathGoal].y ) < 1 && DoRaycast ( pathGoals[currentPathGoal] ) == null ) {
				goal = pathGoals[currentPathGoal];

			} else if ( behaviour == OABehaviour.ChasingTarget && canSeeTarget ) {
				goal = lastKnownPosition;

			}
			
			if ( aiming ) {
				aimDegrees = GetAngleBetween ( this.transform.forward, pathFinder.GetCurrentNode () - this.transform.position, Vector3.up );
			
			} else {
				aimDegrees = 0;
				TurnTowards ( goal );
			
			}
		
		} else {
			aimDegrees = 0;

			if ( behaviour == OABehaviour.ChasingTarget ) {
				TurnTowards ( target.transform.position );
			}			
		
		}

		prevBehaviour = behaviour;
	}
}
