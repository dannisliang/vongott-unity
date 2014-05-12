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
				var a : OACharacter = hit.GetComponent(OACharacter);

				if ( a != null && a.health > 0 ) {
					var dist : float = (a.transform.position-target).sqrMagnitude;
					a.TakeDamage ( damage / dist );

					if ( a.health <= 0 ) {
						for ( var col : Collider in a.GetComponentsInChildren.< Collider > () ) {
							if ( col != hit ) {
								col.rigidbody.AddExplosionForce ( damage * 20, target, radius * 2, 1 );
							}
						}
					}
				}

				// Is it a mine?
				var m : OSGrenade = hit.GetComponent(OSGrenade);

				if ( m != null ) {
					m.Explode ();
				}
			}

			// Is it a destructible object?
			var destructible : DestructibleObject = hit.GetComponent ( DestructibleObject );
			if ( destructible != null ) {
				destructible.Explode ( target, damage * 10, radius );
			}
		}

		GameCamera.GetInstance().Shake ( 0.6, 0.03 );

		StartCoroutine ( DestroyDelayed ( explosion, 10 ) );

		GameCore.Print ( "DamageManager | Explosion!" );
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
