#pragma strict

public enum OABehaviour {
	ChasePlayer,
	Idle,
	RoamingPath,
	RoamingRandom,
	SearchForPlayer,
	Talking,
}

public class OACharacter extends MonoBehaviour {
	public var prefabPath : String = "";
	public var pathFinder : OPPathFinder;
	public var inventory : OSInventory;
	public var conversationTree : OCTree;
	public var isEnemy : boolean = false;
	public var player : GameObject;
	public var health : float = 100;
	
	public var behaviour : OABehaviour = OABehaviour.Idle;
	public var updatePathInterval : float = 5;
	public var usingWeapons : boolean = true;
	public var weaponCategoryPreference : int = 0;
	public var weaponSubcategoryPreference : int = 0;
	public var convoRootNode : int = 0;

	private var updatePathTimer : float = 0;

	public function get preferredWeapon () : OSItem {
		if ( inventory && inventory.definitions ) {
			var cat : OSCategory = inventory.definitions.categories[weaponCategoryPreference];
			var subcat : String = cat.subcategories[weaponSubcategoryPreference];
			
			return inventory.FindItemByCategory ( cat.id, subcat );
		
		} else {
			return null;
		
		}
	}

	public function TakeDamage ( damage : float ) {
		health -= damage;
	}

	public function OnProjectileHit ( damage : float ) {
		TakeDamage ( damage );
	}

	public function Die () {
		
	}

	public function Start () {
		if ( conversationTree ) {
			conversationTree.currentRoot = convoRootNode;
		}
	}

	public function Update () {
		switch ( behaviour ) {
			case OABehaviour.ChasePlayer:
				if ( pathFinder && updatePathTimer <= 0 ) {
					pathFinder.SetGoal ( player.transform.position );
				}
				break;
			
			case OABehaviour.Idle:
				break;
		}

		if ( updatePathTimer > 0 ) {
			updatePathTimer -= Time.deltaTime;
		}

		if ( health <= 0 ) {
			Die ();
		}
	}
}
