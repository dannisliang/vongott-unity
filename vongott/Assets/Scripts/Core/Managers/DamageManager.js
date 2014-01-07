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
	public function SpawnExplosion ( target : Vector3, radius : float, damage : float )  {
		var explosion : GameObject = Instantiate ( prefabExplosion );

		explosion.transform.parent = GameCore.levelContainer;
		explosion.transform.position = target;

		// Inflict colliders
		var colliders : Collider[] = Physics.OverlapSphere ( target, radius );

		for ( var hit : Collider in colliders ) {
			if ( hit.rigidbody != null ) {
				hit.rigidbody.AddExplosionForce ( damage, target, radius, 3 );
			
				// Is it an actor?
				var a : Actor = hit.GetComponent(Actor);

				if ( a != null && a.vitalState == a.vitalState.Alive ) {
					var dist : float = (a.transform.position-target).sqrMagnitude;
					a.TakeDamage ( damage / dist );

					if ( a.vitalState == Actor.eVitalState.Dead ) {
						for ( var col : Collider in a.GetLimbColliders() ) {
							col.rigidbody.AddExplosionForce ( damage * 20, target, radius * 2, 1 );
						}
					}
				}
			}

			// Is it a destructible object?
			var destructible : DestructibleObject = hit.GetComponent ( DestructibleObject );
			if ( destructible != null ) {
				destructible.Explode ( target, damage * 10, radius );
			}
		}

		StartCoroutine ( DestroyDelayed ( explosion, 10 ) );

		GameCore.Print ( "DamageManager | Explosion!" );
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
