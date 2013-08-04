#pragma strict

class DamageManager extends MonoBehaviour {
	// Static vars
	static var instance : DamageManager;
	
	// Constants
	public var expirationTime : float = 20.0;
	
	// Prefab links
	public var prefabBullet : GameObject;
	
	
	//////////////////
	// Spawn
	//////////////////
	// Bullet
	function SpawnBullet ( position : Vector3, target : Vector3, owner : GameObject ) {
		var bullet : GameObject = Instantiate ( prefabBullet );
				
		bullet.transform.parent = GameCore.levelContainer;
		bullet.transform.position = position;
		bullet.transform.LookAt ( target );
		
		var projectile : Projectile = bullet.GetComponent ( Projectile );
		projectile.owner = owner;
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