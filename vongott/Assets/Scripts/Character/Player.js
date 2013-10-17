class Player extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var head : GameObject;
	var hand : GameObject;
	var torso : GameObject;
	var legs : GameObject;
	var arms : GameObject;
	var foot_r : GameObject;
	var foot_l : GameObject;
	var back : GameObject;
	
	var energy : float = 100;
	var health : int = 100;
	var automaticHeal : int = 0;
	
	var equippedItem : GameObject;
	var talkingTo : Actor;
	
	@HideInInspector var shootTimer : float = 0;
	
	private var liftedObject : LiftableItem;
	private var healTimer : float = 0;
	
					
	////////////////////
	// Actor interaction
	////////////////////
	// Turn towards
	function TurnTowards ( v : Vector3 ) {
		var lookPos : Vector3 = v - transform.position;
		lookPos.y = 0;
		
		transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), 4 * Time.deltaTime );
	}
	
	// Talking
	function TalkTo ( a : Actor ) {
		GameCore.ToggleControls ( false );
		
		talkingTo = a;
		this.GetComponent(PlayerController).state = PlayerController.PlayerState.Idle;
		
		GameCore.Print ( "Player | conversation with " + a.displayName + " started" ); 
	}
	
	function StopTalking () : IEnumerator {
		GameCore.Print ( "Player | conversation with " + talkingTo.displayName + " ended" ); 
		
		talkingTo = null;
		GameCamera.GetInstance().BlurFocus ( null );
	
		yield WaitForSeconds ( 1 );
		
		GameCore.ToggleControls ( true );
	}
	
	
	////////////////////
	// Object interaction
	////////////////////
	// Picking up / dropping objects
	function PickUpObject ( obj : LiftableItem ) {
		liftedObject = obj;
		liftedObject.OnPickup ();
	}
	
	function DropObject () {
		liftedObject.OnDrop ();
		liftedObject = null;
	}
	
	// Consume
	function Consume ( item : Item ) {
		if ( item.id == eItemID.BiologicalUpgrade ) {
			var upg : Upgrade = item as Upgrade;
			
			UpgradeManager.IncrementAbility ( upg.ability.id, upg.ability.value );
					
		} else {
			for ( var i = 0; i < item.attr.Length; i++ ) {
				switch ( item.attr[i].type ) {
					case eItemAttribute.Energy:
						energy += Mathf.RoundToInt(item.attr[i].val);
						if ( energy > 100 ) { energy = 100; }
						break;
				}
			}
		}
	}
	
	// Equip
	function Equip ( item : Item, equip : boolean ) {
		if ( !item ) {
			item = equippedItem.GetComponent ( Item );
		}
		
		var slot : Equipment.eEquipmentSlot = item.eqSlot;
		var target : GameObject;
		var adjustPosition : Vector3;
		var adjustRotation : Vector3;
		
		if ( slot == Equipment.eEquipmentSlot.Hands ) {
			target = hand;
		
			adjustPosition = new Vector3 ( 0.222, -0.006, -0.060 );
			adjustRotation = new Vector3 ( 16, 182, 8.5 );
		} else if ( slot == Equipment.eEquipmentSlot.Torso ) {
			target = torso;
		
		} else if ( slot == Equipment.eEquipmentSlot.Head ) {
			target = head;
		
		} else {
			target = foot_r;
		
		} 
		
		if ( equip ) {		
			equippedItem = item.gameObject;
			
			equippedItem.transform.parent = target.transform;
			equippedItem.transform.localPosition = adjustPosition;
			equippedItem.transform.localEulerAngles = adjustRotation;
			equippedItem.GetComponent(BoxCollider).enabled = false;
			equippedItem.GetComponent ( DontGoThroughThings ).enabled = false;
			Destroy ( equippedItem.rigidbody );
		
			if ( IsEquippedWeapon() ) {
				ResetFire();
			}
		
			GameCore.Print ( "Player | item '" + item.title + "' equipped" );
			
		} else {
			Destroy ( equippedItem );
			
			GameCore.Print ( "Player | item '" + item.title + "' unequipped" );
		
			if ( item ) {
				Destroy ( item.gameObject );
			}
		}
	}
	
	function GetEquippedItem () : GameObject {
		return equippedItem;
	}
	
	function IsEquippedWeapon () : boolean {
		if ( equippedItem ) {
			return equippedItem.GetComponent(Item).type == eItemType.Weapon;
		} else {
			return false;
		}
	}
	
	function IsEquippedLockpick () : boolean {
		if ( equippedItem ) {
			return equippedItem.GetComponent(Item).id == eItemID.Lockpick;
		} else {
			return false;
		}
	}
	
	function GetEquipmentAttribute ( a : eItemAttribute ) : float {
		for ( var attr : Item.Attribute in equippedItem.GetComponent(Item).attr ) {
			if ( attr.type == a ) {
				return attr.val;
			} 
		}
		
		GameCore.Error ( "Player | Found no attribute " + a + " for item " + equippedItem );
		
		return 100;
	}
	
	////////////////////
	// Fighting
	////////////////////
	function ResetFire () {
		shootTimer = GetEquipmentAttribute ( eItemAttribute.FireRate );
	}
	
	function Die () {
	
	}
	
	function CanHeal ( amount : int ) : boolean {
		return health + amount <= UpgradeManager.GetAbility ( eAbilityID.MaxHealth );
	}
	
	function TakeDamage ( amount : int ) {
		health -= amount;
	
		GameCore.Print ( "Player | Damage taken: " + amount );
	}
	
	function Shoot ( target : Vector3 ) {
		if ( shootTimer >= GetEquipmentAttribute ( eItemAttribute.FireRate ) ) {
			shootTimer = 0;
		
			var accuracyDecimal : float = 1.0 - ( GetEquipmentAttribute ( eItemAttribute.Accuracy ) / 100 );
			var accuracyDegree : float = Random.Range ( -accuracyDecimal, accuracyDecimal );
		
			if ( GameCore.GetInstance().timeScale == 1.0 ) {
				target += Vector3.one * accuracyDegree;
			}
		
			DamageManager.GetInstance().SpawnBullet ( equippedItem, target, this.gameObject );
		
			// Muzzle flash
			if ( equippedItem.transform.GetChild(0) ) {
				equippedItem.transform.GetChild(0).gameObject.SetActive ( true );
			}
		}
	}
	
	
	////////////////////
	// Upgrades
	////////////////////
	function StartAutoHeal ( amount : int ) {
		healTimer = 1;
		automaticHeal = amount;
	}
	
	function StopAutoHeal () {
		automaticHeal = 0;
		UpgradeManager.Deactivate ( eSlotID.Torso );
	}
	
	function HasFullHealth () : boolean {		
		return health == UpgradeManager.GetAbility ( eAbilityID.MaxHealth );
	}
	
	function Heal ( amount : int ) {
		if ( CanHeal ( amount ) ) {
			health += amount;
		
		} else if ( !HasFullHealth() ) {
			health = UpgradeManager.GetAbility ( eAbilityID.MaxHealth );
		
		} else {
			StopAutoHeal ();
			return;
			
		}
	
		GameCore.Print ( "Player | Healing: " + health );
	}
	
	// Install
	function Install ( upg : Upgrade, install : boolean ) {
		if ( install ) {
			UpgradeManager.Install ( upg );
		} else {
			UpgradeManager.Remove ( upg.upgSlot );
		}
	}
	
	
	////////////////////
	// Trigger
	////////////////////
	function OnTriggerEnter ( other : Collider ) {				
		if ( other.GetComponent ( InteractiveObject ) ) {
			other.GetComponent ( InteractiveObject ).Focus ();
		}
	}
	
	function OnTriggerExit ( other : Collider ) {				
		if ( other.GetComponent ( InteractiveObject ) ) {
			other.GetComponent ( InteractiveObject ).Unfocus ();
		}
	}
	
	
	////////////////////
	// Update
	////////////////////	
	function Update () {
		// Lifting object
		if ( liftedObject ) {
			liftedObject.transform.rotation = this.transform.rotation;
			liftedObject.transform.position = torso.transform.position + this.transform.forward;
		}
		
		// Talking
		if ( talkingTo != null ) {
			TurnTowards ( talkingTo.transform.position );
		}
		
		// Equipped weapon
		if ( equippedItem && IsEquippedWeapon() ) {	
			if ( shootTimer < GetEquipmentAttribute ( eItemAttribute.FireRate ) ) {
				shootTimer += Time.deltaTime;
			}
			
		}
		
		// Automatic heal
		if ( automaticHeal > 0 ) {
			if ( healTimer <= 0 ) {
				Heal ( automaticHeal );
				healTimer = 1;
			} else {
				healTimer -= Time.deltaTime;
			}
		}
		
		// Calculate energy cost
		energy -= UpgradeManager.CalculateEnergyCost() * Time.deltaTime;
	
		if ( energy <= 0 ) {
			energy = 0;
			UpgradeManager.DeactivateAll ();
		}
	}
}