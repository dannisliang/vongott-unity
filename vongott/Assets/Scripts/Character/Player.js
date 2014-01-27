#pragma strict

class Player extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	public var head : Transform;
	public var hand : Transform;
	
	public var energy : float = 100;
	public var health : int = 100;
	
	public var automaticHeal : int = 0;
	public var shieldPrefab : GameObject;
	
	public var talkingTo : Actor;

	// Private vars	
	private var shield : GameObject;
	private var liftedObject : LiftableItem;
	private var equippedObject : Item;
	private var shootTimer : float = 0;
	private var healTimer : float = 0;
	private var controller : PlayerController;
	private var capsuleCollider : CapsuleCollider;

					
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
		
		this.GetComponent(Animator).SetFloat ( "DeltaVertical", 0 );
		this.GetComponent(Animator).SetFloat ( "DeltaHorizontal", 0 );
		this.GetComponent(Animator).SetFloat ( "DeltaCombined", 0 );
		
		GameCore.Print ( "Player | conversation with " + a.displayName + " started" ); 
	}
	
	function StopTalking () {
		GameCore.Print ( "Player | conversation with " + talkingTo.displayName + " ended" ); 
		
		talkingTo = null;
	
		StartCoroutine ( GameCore.GetInstance().ExecuteWithDelay ( function () { GameCore.ToggleControls ( true ); }, 1 ) );
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

	// Throw
	function Throw () {
		var obj : Item = Instantiate ( equippedObject ) as Item;
		obj.transform.parent = this.transform.parent;
		
		obj.GetComponent(BoxCollider).enabled = true;
		obj.rigidbody.useGravity = true;
		obj.rigidbody.isKinematic = false;
		
		obj.transform.position = equippedObject.transform.position;
		obj.transform.eulerAngles = equippedObject.transform.eulerAngles;
		obj.transform.localScale = Vector3.one;

		obj.rigidbody.velocity = GameCamera.GetInstance().transform.forward * 10;

		// Arm mine
		if ( obj.GetComponent ( Mine ) ) {
			obj.GetComponent ( Mine ).Arm();
		}
	}

	// Equip
	public function DestroyEquipped () {
		if ( equippedObject ) {
			Destroy ( equippedObject.gameObject );
		}
	}
	
	function Equip ( item : Item ) {
		var slot : eEquipmentSlot = ( item as Equipment ).eqSlot;
		var target : Transform;
		var adjustPosition : Vector3;
		var adjustRotation : Vector3;
		
		if ( slot == eEquipmentSlot.Hands ) {
			target = hand;
		
			adjustPosition = new Vector3 ( 0.222, -0.006, -0.060 );
			adjustRotation = new Vector3 ( 16, 182, 8.5 );
	
		} else if ( slot == eEquipmentSlot.Head ) {
			target = head;
		
		} 
		
		equippedObject = Instantiate ( item ) as Item;
		equippedObject.transform.parent = target;
		equippedObject.transform.localPosition = adjustPosition;
		equippedObject.transform.localEulerAngles = adjustRotation;
		equippedObject.GetComponent(BoxCollider).enabled = false;
		equippedObject.rigidbody.useGravity = false;
		equippedObject.rigidbody.isKinematic = true;
	
		if ( IsEquippedWeapon() ) {
			ResetFire();
		}
	
		GameCore.Print ( "Player | item '" + item.title + "' equipped" );
	}
	
	function IsEquippedWeapon () : boolean {
		if ( InventoryManager.GetInstance().equippedItem ) {
			return InventoryManager.GetInstance().equippedItem.GetComponent(Item).type == eItemType.Weapon;
		} else {
			return false;
		}
	}
	
	function IsEquippedLockpick () : boolean {
		if ( InventoryManager.GetInstance().equippedItem ) {
			return InventoryManager.GetInstance().equippedItem.GetComponent(Item).id == eItemID.Lockpick;
		} else {
			return false;
		}
	}
	
	function GetEquipmentAttribute ( a : eItemAttribute ) : float {
		var item : Item = equippedObject;

		for ( var attr : Item.Attribute in item.attr ) {
			if ( attr.type == a ) {
				return attr.val;
			} 
		}
		
		GameCore.Error ( "Player | Found no attribute " + a + " for item " + item );
		
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
	
	function Shoot () {
		var cam : Camera = GameCamera.GetInstance().GetComponent(Camera);
		var ray : Ray = cam.ScreenPointToRay ( new Vector3 ( Screen.width/2, Screen.height/2, 0 ) );
		var hit : RaycastHit;
		var range : float = 1000;
		var target : Vector3 = cam.transform.position + ray.direction * range;

		if ( Physics.Raycast ( ray, hit, range ) ) {
			target = hit.point;
		}

		Shoot ( target );
	}

	function Shoot ( target : Vector3 ) {
		if ( equippedObject == null ) { return; }
		
		var eq : Equipment = equippedObject as Equipment;
		
		if ( eq == null ) { return; }

		switch ( eq.id ) {
			// Mines
			case eItemID.Mine:
				if ( shootTimer >= GetEquipmentAttribute ( eItemAttribute.FireRate ) ) {
					shootTimer = 0;
				
					Throw ();
				}
				break;

			// Bullets
			default:
				if ( shootTimer >= GetEquipmentAttribute ( eItemAttribute.FireRate ) ) {
					shootTimer = 0;
				
					var accuracyDecimal : float = 1.0 - ( GetEquipmentAttribute ( eItemAttribute.Accuracy ) / 100 );
					var accuracyDegree : float = Random.Range ( -accuracyDecimal, accuracyDecimal );
				
					if ( GameCore.GetInstance().timeScale == 1.0 ) {
						target += Vector3.one * accuracyDegree;
					}
				
					DamageManager.GetInstance().SpawnBullet ( equippedObject.gameObject, target, this.gameObject );
				
					// Muzzle flash
					if ( equippedObject.transform.GetChild(0) ) {
						equippedObject.transform.GetChild(0).gameObject.SetActive ( true );
					}
				}
				break;
		}	
	}
	
	
	////////////////////
	// Upgrades
	////////////////////
	// Shield
	function StartShield ( level : int ) {
		shield = Instantiate ( shieldPrefab ) as GameObject;
		shield.transform.parent = this.transform;
		shield.transform.localPosition = new Vector3 ( 0, 1, 0 );
		shield.transform.localScale = new Vector3 ( 0.1, 0.1, 0.1 );
		
		iTween.ScaleTo ( shield, iTween.Hash ( "scale", Vector3.one, "easetype", iTween.EaseType.easeInQuad, "time", 0.5, "ignoretimescale", true ) );
	}
	
	function StopShield () {
		iTween.ScaleTo ( shield, iTween.Hash ( "scale", Vector3.one / 100, "easetype", iTween.EaseType.easeInQuad, "time", 0.5, "ignoretimescale", true, "oncompletetarget", this.gameObject, "oncomplete", "DestroyShield" ) );
	}
	
	function DestroyShield () {
		Destroy ( shield );
	}
	
	// Healing
	function StartAutoHeal ( amount : int ) {
		healTimer = 1;
		automaticHeal = amount;
	}
	
	function StopAutoHeal () {
		automaticHeal = 0;
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
			UpgradeManager.Deactivate ( eSlotID.Torso );
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
	// Update
	////////////////////	
	function Update () {
		// Collider reference
		if ( !capsuleCollider ) {
			capsuleCollider = this.GetComponent(CapsuleCollider);
		}

		// Lifting object
		if ( liftedObject ) {
			liftedObject.transform.rotation = this.transform.rotation;
			liftedObject.transform.position = head.position + this.transform.forward;
		}
		
		// Talking
		if ( talkingTo != null ) {
			TurnTowards ( talkingTo.transform.position );
		}
		
		// Equipped weapon
		if ( IsEquippedWeapon() ) {	
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
		
		// Shield
		if ( shield ) {
			shield.transform.eulerAngles = Vector3.zero;
		}
		
		// Player state
		switch ( PlayerController.actionState ) {
			case ePlayerActionState.Shooting:
				Shoot ();
				break;
		}

		switch ( PlayerController.bodyState ) {
			case ePlayerBodyState.Crouching:
				capsuleCollider.height = 1;
				break;
			
			default:
				capsuleCollider.height = 1.8;
				break;
		}

		// Calculate energy cost
		energy -= UpgradeManager.CalculateEnergyCost() * Time.deltaTime;
	
		if ( energy < 0 ) {
			energy = 0;
			UpgradeManager.DeactivateAll ();
		}
	}
}
