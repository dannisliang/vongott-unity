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
	private var animator : Animator;
	private var prevBehaviour : OABehaviour;

	// Inventory
	public var inventory : OSInventory;
	public var usingWeapons : boolean = true;
	public var weaponCategoryPreference : int = 0;
	public var weaponSubcategoryPreference : int = 0;
	
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

	public function get convoSpeakers () : GameObject [] {
		if ( conversationTree ) {
			if ( convoSpeakerObjects.Length != conversationTree.speakers.Length ) {
				convoSpeakerObjects = new GameObject [conversationTree.speakers.Length];
			}

			return convoSpeakerObjects;
		}
		
		return null;
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

		if ( health >= 0 ) {
			Die ();
		}
	}

	public function OnProjectileHit ( damage : float ) {
		TakeDamage ( damage );
	}

	public function Die () {
		if ( destroyOnDeath ) {
			Destroy ( this.gameObject );
		}
	}

	public function UpdateSpeakers () {
		if ( conversationTree ) {
			conversationTree.currentRoot = convoRootNode;
		}
	}

	public function Start () {
		UpdateSpeakers ();
		animator = this.GetComponent.< Animator > ();
	}

	public function Update () {
		var changed : boolean = behaviour != prevBehaviour;
		
		switch ( behaviour ) {
			case OABehaviour.ChasePlayer:
				if ( player && pathFinder && updatePathTimer <= 0 ) {
					pathFinder.SetGoal ( player.transform.position );
				}
				speed = 1;
				break;
			
			case OABehaviour.Idle:
				speed = 0;
				break;

			case OABehaviour.RoamingPath:
				if ( pathGoals.Length > 0 && pathFinder ) {
					if ( Vector3.Distance ( this.transform.position, pathGoals[currentPathGoal] ) < 0.5 ) {
						NextPathGoal ();
						behaviour = OABehaviour.RoamingPath;

					} else {
						pathFinder.SetGoal ( pathGoals[currentPathGoal] );
					
					}
				}
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
		}

		if ( speed > 0 && pathFinder ) {
			var lookPos : Vector3 = pathFinder.GetCurrentGoal() - this.transform.position;
			lookPos.y = 0;
			
			transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), turningSpeed * Time.deltaTime );
		}

		prevBehaviour = behaviour;
	}
}
