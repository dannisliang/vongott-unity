#pragma strict

class DamageManager extends MonoBehaviour {
	// Static vars
	static var instance : DamageManager;
	
	// Constants
	public var bulletSpeed : float = 10.0;
	public var expirationTime : float = 20.0;
	
	// Prefab links
	public var prefabBullet : GameObject;
	
	// Collections
	public var allProjectiles : List.< Projectile > = new List.< Projectile > ();
	
	
	//////////////////
	// Spawn
	//////////////////
	// Bullet
	function SpawnBullet ( position : Vector3, target : Vector3 ) {
		var bullet : GameObject = Instantiate ( prefabBullet );
		bullet.transform.parent = GameCore.levelContainer;
		bullet.transform.position = position;
		bullet.transform.LookAt ( target );
		
		var projectile : Projectile = bullet.GetComponent ( Projectile );
		projectile.damage = 1.0;
		projectile.speed = bulletSpeed;
		
		allProjectiles.Add ( projectile );
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
	
	
	/////////////////
	// Update
	/////////////////
	function Update () {
		for ( var i = 0 ; i < allProjectiles.Count; i++ ) {
			var current : Projectile = allProjectiles[i];
			
			// Check for destroyed instances
			if ( current == null ) {
				allProjectiles.RemoveAt ( i );
	
			// Check for expiration
			} else if ( current.time > expirationTime ) {
				Destroy ( current.gameObject );
				allProjectiles.RemoveAt ( i );
			
			} else {
				current.transform.Translate ( Vector3.forward * ( current.speed * Time.deltaTime ) );
				current.time += Time.deltaTime;
			
			} 
		}
	}
}