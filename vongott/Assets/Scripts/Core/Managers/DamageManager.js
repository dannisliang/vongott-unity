#pragma strict

class DamageManager extends MonoBehaviour {
	// Static vars
	static var instance : DamageManager;
	
	// Constants
	public var expirationTime : float = 20.0;
	
	// Prefab links
	public var prefabBullet : GameObject;
	public var prefabExplosion : GameObject;

	
	//////////////////
	// Destroy
	//////////////////
	private function DestroyDelayed ( obj : GameObject, seconds : float ) : IEnumerator {
		yield WaitForSeconds ( seconds );

		Destroy ( obj );
	}

	//////////////////
	// Spawn
	//////////////////
	// Bullet
	function SpawnBullet ( origin : GameObject, target : Vector3, owner : GameObject ) {
		var weapon : Item = origin.GetComponent ( Equipment ) as Item;
		
		var bullet : GameObject = Instantiate ( prefabBullet );
				
		bullet.transform.parent = GameCore.levelContainer;
		bullet.transform.position = weapon.transform.position;
		bullet.transform.LookAt ( target );
		
		var projectile : Projectile = bullet.GetComponent ( Projectile );
		projectile.owner = owner;
		projectile.damage = GetEquipmentAttribute ( weapon, eItemAttribute.Damage );
		projectile.expirationTime = GetEquipmentAttribute ( weapon, eItemAttribute.FireRange ) / projectile.speed;
	}
	
	// Explosion
	public function SpawnExplosion ( target : Vector3, radius : float, damageMultiplier : float )  {
		var explosion : GameObject = Instantiate ( prefabExplosion );

		explosion.transform.parent = GameCore.levelContainer;
		explosion.transform.position = target;

		// Read all actors
		var allActors : Actor[] = GameCore.GetActors ();

		for ( var i : int = 0; i < allActors.Length; i++ ) {
			var a : Actor = allActors[i];
			var dist : float = (a.transform.position-target).sqrMagnitude;

			if ( dist <= radius ) {
				a.TakeDamage ( damageMultiplier - dist );
			}
		}

		StartCoroutine ( DestroyDelayed ( explosion, 10 ) );
	}


	/////////////////
	// Get info
	/////////////////
	// Attr
	function GetEquipmentAttribute ( item : Item, a : eItemAttribute ) : float {
		for ( var attr : Item.Attribute in item.GetComponent(Item).attr ) {
			if ( attr.type == a ) {
				return attr.val;
			} 
		}
		
		GameCore.Error ( "DamageManager | Found no attribute " + a + " for item " + item );
		
		return 100;
	}
	
	
	/////////////////
	// Init
	/////////////////
	// Start
	function Start () {
		instance = this;
	}
	
	// Get instance
	static function GetInstance () : DamageManager {
		return instance;
	}
}
