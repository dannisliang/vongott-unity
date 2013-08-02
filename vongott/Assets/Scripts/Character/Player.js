class Player extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var head : GameObject;
	var hand : GameObject;
	var torso : GameObject;
	var foot_r : GameObject;
	var foot_l : GameObject;
	var equippedItem : GameObject;

	@HideInInspector var shootTimer : float = 0;
			
	////////////////////
	// Public functions
	////////////////////
	// Equip
	function Equip ( entry : Entry, equip : boolean ) {
		var slot : Equipment.Slots = entry.eqSlot;
		var target : GameObject;
		var adjustPosition : Vector3;
		var adjustRotation : Vector3;
		
		if ( slot == Equipment.Slots.Hands ) {
			target = hand;
		
			adjustPosition = new Vector3 ( 0.06410789, -0.02394938, -0.05132291 );
			adjustRotation = new Vector3 ( 345.9895, 4.343473, 342.7763 );
		} else if ( slot == Equipment.Slots.Torso ) {
			target = torso;
		
		} else if ( slot == Equipment.Slots.Head ) {
			target = head;
		
		} else {
			target = foot_r;
		
		} 
		
		if ( equip ) {		
			equippedItem = Instantiate ( Resources.Load ( entry.model ) as GameObject );
			
			equippedItem.transform.parent = target.transform;
			equippedItem.transform.localPosition = adjustPosition;
			equippedItem.transform.localEulerAngles = adjustRotation;
			equippedItem.collider.enabled = false;
		
			ResetFire();
		
			GameCore.Print ( "Player | item '" + entry.title + "' equipped" );
			
		} else {
			Destroy ( equippedItem );
			
			GameCore.Print ( "Player | item '" + entry.title + "' unequipped" );
		
		}
	}
	
	function GetEquippedItem () : GameObject {
		return equippedItem;
	}
	
	function GetEquipmentAttribute ( a : Item.Attributes ) : float {
		for ( var attr : Item.Attribute in equippedItem.GetComponent(Item).attr ) {
			if ( attr.type == a ) {
				return attr.val;
			} 
		}
		
		GameCore.Error ( "Player | Found no attribute " + a + " for item " + equippedItem );
		
		return 100;
	}
	
	// Shoot
	function ResetFire () {
		shootTimer = GetEquipmentAttribute ( Item.Attributes.FireRate );
	}
	
	function Shoot ( target : Vector3 ) {
		if ( shootTimer >= GetEquipmentAttribute ( Item.Attributes.FireRate ) ) {
			shootTimer = 0;
		
			DamageManager.GetInstance().SpawnBullet ( equippedItem.transform.position, target );
			Debug.Log ( "BANG!" );
		}
	}
	
	// Install
	function Install ( entry : Entry, install : boolean ) {
		var slot : Upgrade.Slots = entry.upgSlot;
		
		if ( install ) {
			GameCore.Print ( "Player | installed upgrade " + entry.title + " in " + slot );
		} else {
			GameCore.Print ( "Player | uninstalled upgrade " + entry.title );
		}
	}
	
	function Start () {
		
	}
		
	function Update () {
		if ( equippedItem ) {	
			if ( shootTimer < GetEquipmentAttribute ( Item.Attributes.FireRate ) ) {
				shootTimer += Time.deltaTime;
			}
			
		}
	}
}