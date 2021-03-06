﻿#pragma strict

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
	public class Bark {
		public enum Type {
			Die,
			Faint,
			GoHome,
			SeeTarget,
			HearTarget,
			Flee,
			TakeDamage
		}

		public var type : Type;
		public var clip : AudioClip;
		public var subtitle : String = "";
	}
	
	public var stats : OSStats;
	public var skillTree : OSSkillTree;
	public var behaviour : OABehaviour = OABehaviour.Idle;
	public var target : GameObject;
	public var singleWeapon : OSItem;
	public var equippingHand : Transform;
	public var targetTag : String = "Player";
	public var attackTarget : boolean = false;
	public var unconcious : boolean = false;
	public var destroyOnDeath : boolean = false;
	public var destroyWeaponOnDeath : boolean = false;
	public var hasInfiniteAmmo : boolean = true;
	public var usingRootMotion : boolean = true;
	public var weaponAutoAim : boolean = false;
	public var maxSpeed : float = 2;
	public var alertNeighborRadius : float = 20;
	public var attentionSpan : float = 30;
	public var fieldOfView : float = 130;
	public var hesitation : float = 1;
	public var lineOfSight : float = 20;
	public var roamingRadius : float = 10;
	public var shootingDistance : float = 10;
	public var stoppingDistance : float = 2;
	public var fleeThreshold : float = 25;
	public var team : int = 1;
	@HideInInspector public var barks : Bark[] = new Bark [0];
	
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
	private var speed : float = 0;
	private var equippingContainer : Transform;
	private var eventHandler : OCEventHandler;
	private var frozen : boolean = false;

	// Inventory
	@HideInInspector public var inventory : OSInventory;
	@HideInInspector public var usingWeapons : boolean = true;
	@HideInInspector public var weaponCategoryPreference : int = 0;
	@HideInInspector public var weaponSubcategoryPreference : int = 0;
	
	private var equippedObject : OSItem;
	
	// Conversation
	@HideInInspector public var conversationTreePath : String = "";
	@HideInInspector public var conversationTree : OCTree;
	@HideInInspector public var convoSpeakerObjects : GameObject [] = new GameObject [0];
	@HideInInspector public var convoFacing : int = 0;
	@HideInInspector public var convoRootNode : int = 0;

	// Path
	@HideInInspector public var pathFinder : OPPathFinder;
	@HideInInspector public var pathGoals : Vector3 [] = new Vector3[0];
	@HideInInspector public var turningSpeed : float = 4;
	
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
		if ( singleWeapon ) {
			return singleWeapon;

		} else if ( inventory && inventory.definitions ) {
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
						lastKnownPosition = target.transform.position;
						return true;
					
					} else {
						return false;

					}
				}
			}

		}

		return false;
	}

	public function Freeze () {
		frozen = true;
		animator = this.GetComponent.< Animator > ();
		
		if ( animator ) {
			animator.enabled = false;
		}
	}

	public function PlayBark ( bark : String ) {
		for ( var i : int = 0; i < barks.Length; i++ ) {
			if ( barks[i].clip && barks[i].clip.name == bark && audio ) {
				audio.clip = barks[i].clip;
				audio.Play ();
				
				if ( eventHandler ) {
					eventHandler.Event ( "OnPlayBark", barks[i] );
				}
				
				break;
			}
		}
	}
	
	public function PlayBark ( bark : Bark.Type ) {
		var candidates : List.< Bark > = new List.< Bark > ();
		
		for ( var i : int = 0; i < barks.Length; i++ ) {
			if ( barks[i].clip && barks[i].type == bark ) {
				candidates.Add ( barks[i] );
			}
		}

		if ( audio && candidates.Count > 0 ) {
			var b : int = Random.Range ( 0, candidates.Count - 1 );
			audio.clip = candidates [ b ].clip;
			audio.Play ();
				
			if ( eventHandler ) {
				eventHandler.Event ( "OnPlayBark", candidates[b] );
			}
		}
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
		
		} else {
			PlayBark ( Bark.Type.TakeDamage );

		}
		
		if ( DoRaycast ( target.transform.position ) == null && behaviour != OABehaviour.ChasingTarget ) {
			DetectTarget ();
			AlertNeighbors ();
			behaviour = OABehaviour.ChasingTarget;
			pathFinder.SetGoal ( target.transform.position );
		}	
	}

	public function NewInitialPosition () {
		initialPosition = this.transform.position;
		initialRotation = this.transform.rotation;
	}

	public function OnHeardSound ( go : GameObject ) {
		var firearm : OSFirearm = go.GetComponent.< OSFirearm > ();

		if ( firearm && firearm.wielder ) {
			var c : OACharacter = firearm.wielder.GetComponent.< OACharacter > ();

			if ( c ) {
				if ( c.team == team ) {
					DetectTarget ( c.target );
					AlertNeighbors ();
				
				} else {
					DetectTarget ( c.gameObject );
					AlertNeighbors ();

				}

			} else if ( firearm.wielder.tag == targetTag ) {
				if ( targetTag == "Player" && team == 0 ) { return; }
				
				DetectTarget ( firearm.wielder );
				AlertNeighbors ();
			}
		}
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

		if ( equippedObject.collider ) {
			equippedObject.collider.enabled = false;
		}

		if ( !equippingHand ) {
			equippingHand = this.transform;
		}

		if ( !equippingContainer ) {
			equippingContainer = new GameObject ( "EquippingContainer" ).transform;
			equippingContainer.parent = equippingHand;
			equippingContainer.localPosition = Vector3.zero;
			equippingContainer.localEulerAngles = Vector3.zero;
			equippingContainer.localScale = Vector3.one;
		}

		equippedObject.transform.parent = equippingContainer;
		equippedObject.transform.localPosition = Vector3.zero;
		equippedObject.transform.localEulerAngles = Vector3.zero;
		equippedObject.transform.localScale = Vector3.one;
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
		PlayBark ( Bark.Type.Die );
		
		if ( destroyOnDeath ) {
			StartCoroutine ( function () : IEnumerator {
				var explosions : Component [] = this.GetComponentsInChildren ( OSExplosion, true );
				
				if ( explosions && explosions.Length > 0 ) {
					explosions[0].transform.parent = this.transform.parent;
					explosions[0].transform.position = this.transform.position;
					explosions[0].gameObject.SetActive ( true );
				}

				if ( audio ) {
					while ( audio.isPlaying ) {
						yield null;
					}
				
				} else {
					yield null;

				}
				
				Destroy ( this.gameObject );
			} () );
		
		} else {
			SetRagdoll ( true );
		
		}

		stats.hp = 0;

		if ( equippedObject && !destroyWeaponOnDeath ) {
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
		PlayBark ( Bark.Type.Faint );
		
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
		for ( var c : Collider in this.GetComponentsInChildren.< Collider > () ) {
			c.enabled = state;

			if ( c != this.collider && c.rigidbody ) {
				c.rigidbody.isKinematic = !state;
			}
		}

		if ( this.collider ) {
			this.collider.enabled = !state;
		}

		if ( controller ) {
			controller.enabled = !state;
		}

		if ( animator ) {
			animator.enabled = !state;
		}
	}

	public function TurnTowards ( v : Vector3 ) {
		TurnTowards ( v, 0 );
	}

	public function TurnTowards ( v : Vector3, extraAngle : float ) {
		if ( v == transform.position ) { return; }

		var lookPos : Vector3 = v - transform.position;
		lookPos.y = 0;
		lookPos.x += extraAngle;
		
		this.transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( lookPos ), turningSpeed * Time.deltaTime );
	}
	
	public function ShootAtTarget () {
		if ( usingWeapons ) {
			if ( !equippedObject ) {
				EquipPreferredWeapon ();

			} else {
				var firearm : OSFirearm = equippedObject.GetComponent.< OSFirearm > ();
				var melee : OSMelee = equippedObject.GetComponent.< OSMelee > ();
				var fireCenter : Vector3 = target.transform.position;

				if ( target.collider ) {
					fireCenter = target.collider.bounds.center;
					fireCenter.y = target.collider.bounds.max.y - 0.4;
				}

				if ( weaponAutoAim ) {
					equippingContainer.transform.LookAt ( fireCenter );
				
				} else {
					equippingContainer.transform.rotation = this.transform.rotation;
				
				}

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
		eventHandler = GameObject.FindObjectOfType.< OCEventHandler > ();

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
		var colliders : Collider[] = Physics.OverlapSphere ( this.transform.position, alertNeighborRadius );

		for ( var c : Collider in colliders ) {
			var a : OACharacter = c.gameObject.GetComponent.< OACharacter > ();

			if ( a && a != this && a.team == team ) {
				a.DetectTarget ( target );
			}
		}
	}

	public function DetectTarget ( newTarget : GameObject ) {
		if ( target != this.gameObject && target != newTarget ) {
		 	target = newTarget;
			DetectTarget ();
		}
	}

	public function DetectTarget () {
		if ( behaviour == OABehaviour.ChasingTarget || behaviour == OABehaviour.Fleeing ) { return; }
		
		if ( usingWeapons ) {
			attackTarget = true;
			hesitationTimer = hesitation;
			attentionTimer = attentionSpan;
		
			if ( canSeeTarget ) {
				PlayBark ( Bark.Type.SeeTarget );
				behaviour = OABehaviour.ChasingTarget;
				
				if ( eventHandler ) {
					eventHandler.Event ( "OnChaseStart", this );
				}
			
			} else {
				PlayBark ( Bark.Type.HearTarget );
				behaviour = OABehaviour.Seeking;
				
				if ( eventHandler ) {
					eventHandler.Event ( "OnSeekingStart", this );
				}

			}
	
		} else {
			behaviour = OABehaviour.Fleeing;
			attentionTimer = attentionSpan;
			
			PlayBark ( Bark.Type.Flee );

		}
	}

	public function Update () {
		if ( frozen || !alive || unconcious ) { return; }

		var changed : boolean = behaviour != prevBehaviour;
		aiming = false;
		
		switch ( behaviour ) {
			case OABehaviour.ChasingTarget:
				if ( !usingWeapons || stats.hp < fleeThreshold ) {
					behaviour = OABehaviour.Fleeing;
					attentionTimer = attentionSpan;
					break;
				}
			
				if ( target == this.gameObject ) {
					target = null;
				}

				if ( !target ) {
					behaviour = OABehaviour.Idle;
					break;
				}
				
				if ( distanceToTarget > stoppingDistance || !canSeeTarget ) {
					if ( distanceToTarget <= shootingDistance && canSeeTarget && !pathFinder.facingDrop ) {
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

				} else if ( canSeeTarget && distanceToTarget <= shootingDistance ) {
					pathFinder.SetGoal ( lastKnownPosition );
				
					if ( attackTarget ) {
						attentionTimer = attentionSpan;
					
						if ( hesitationTimer <= 0 && distanceToTarget <= shootingDistance && !pathFinder.facingDrop ) {
							ShootAtTarget ();
							aiming = true;
						}
					}
				
				} else {
					if ( pathFinder.hasPath && pathFinder.atEndOfPath ) {
						if ( attentionTimer <= 0 ) {
							behaviour = OABehaviour.Seeking;
							attentionTimer = attentionSpan;
						
						} else {
							lastKnownPosition = target.transform.position;
							pathFinder.SetGoal ( lastKnownPosition );

						}
					}
					
				}
				
				if ( attackTarget ) {
					if ( attentionTimer <= 0 ) {
						hesitationTimer = hesitation;
						
						behaviour = OABehaviour.Seeking;
						attentionTimer += attentionSpan;
					
					} else if ( attentionTimer > 0 ) {
						attentionTimer -= Time.deltaTime;

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
					seekingGoal = OPScanner.GetInstance().GetClosestNode ( lastKnownPosition + new Vector3 ( Random.Range ( -roamingRadius, roamingRadius ), 0, Random.Range ( -roamingRadius, roamingRadius ) ) ).position;

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
					if ( pathFinder.hasPath && pathFinder.atEndOfPath || Vector3.Distance ( this.transform.position, pathGoals[currentPathGoal] ) < 0.5 ) {
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
			// Set immediate goal	
			var goal : Vector3 = pathFinder.GetCurrentGoal ();
		
			// Aiming
			if ( aiming ) {
				aimDegrees = GetAngleBetween ( this.transform.forward, pathFinder.GetCurrentNode () - this.transform.position, Vector3.up );
			
			} else {
				aimDegrees = 0;
				TurnTowards ( goal, pathFinder.localAvoidanceAngle );
			
			}
		
		} else {
			aimDegrees = 0;

			if ( behaviour == OABehaviour.ChasingTarget ) {
				TurnTowards ( target.transform.position );
			}			
		
		}

		// Apply motion
		var moveDirection : Vector3;
		
		if ( !usingRootMotion && speed > 0 ) {
			moveDirection = this.transform.forward * ( speed * maxSpeed * Time.deltaTime );
		}

		moveDirection += Physics.gravity * Time.deltaTime;

		controller.Move ( moveDirection );

		// Register behaviour from this frame
		prevBehaviour = behaviour;
	}
}
