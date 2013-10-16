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
	function SpawnBullet ( origin : GameObject, target : Vector3, owner : GameObject ) {
		var weapon : Item = origin.GetComponent ( Equipment ) as Item;
		
		var bullet : GameObject = Instantiate ( prefabBullet );
				
		bullet.transform.parent = GameCore.levelContainer;
		bullet.transform.position = weapon.transform.position;
		bullet.transform.LookAt ( target );
		
		var projectile : Projectile = bullet.GetComponent ( Projectile );
		projectile.owner = owner;
	
		projectile.expirationTime = GetEquipmentAttribute ( weapon, eItemAttribute.FireRange ) / projectile.speed;
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