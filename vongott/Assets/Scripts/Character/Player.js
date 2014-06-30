#pragma strict

class Player extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	public var head : Transform;
	public var hand : Transform;
	
	public var controller : PlayerController;

	public var stats : OSStats;
	public var skillTree : OSSkillTree;

	public var automaticHeal : int = 0;
	public var shieldPrefab : GameObject;
	public var inventory : OSInventory;

	// Private vars	
	private var shield : GameObject;
	private var liftedObject : LiftableItem;
	private var equippedObject : OSItem;
	private var shootTimer : float = 0;
	private var healTimer : float = 0;
				
	// Turn towards
	function TurnTowards ( v : Vector3 ) {
		var lookPos : Vector3 = v - transform.position;
		lookPos.y = 0;
		
		transform.rotation = Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( lookPos ), 4 * Time.deltaTime );
	}
	
	
	////////////////////
	// Object interaction
	////////////////////
	// Picking up / dropping objects
	function PickUpObject ( obj : LiftableItem ) {
		if ( !liftedObject ) {
			liftedObject = obj;
			liftedObject.OnPickup ();
		}
	}
	
	function DropObject () {
		if ( liftedObject ) {
			liftedObject.OnDrop ();
			liftedObject = null;
		}
	}
	
	// Checks
	public function CheckWeaponPosition () {
		if ( equippedObject ) {
			if ( GameCamera.controller.state == eCameraState.FirstPerson ) {
				equippedObject.transform.parent = Camera.main.transform;
				equippedObject.transform.localPosition = new Vector3 ( 0.27, -0.17, 1 );
				equippedObject.transform.localEulerAngles = Camera.main.transform.forward;
			} else {
				equippedObject.transform.parent = hand;
				equippedObject.transform.localPosition = Vector3.zero;;
				equippedObject.transform.localEulerAngles = hand.forward;;
			}
		}
	}

	// Holster/unholster
	public function HolsterItem () {

	}

	public function UnholsterItem () {

	}


	////////////////////
	// Inventory interfacing
	////////////////////
	public function OnUnequipAll () {
		GameCamera.GetInstance().controller.Unlock ();
		
		if ( equippedObject ) {
			Destroy ( equippedObject.gameObject );
		}
	}

	function OnEquipItem ( item : OSItem ) {
		equippedObject = Instantiate ( item ) as OSItem;
		equippedObject.transform.parent = hand;
		equippedObject.transform.localPosition = Vector3.zero;
		equippedObject.transform.localEulerAngles = hand.forward;
		equippedObject.GetComponent(BoxCollider).enabled = false;
		equippedObject.rigidbody.useGravity = false;
		equippedObject.rigidbody.isKinematic = true;
		
		item.PlaySound ( "equip" );

		equippedObject.SendMessage ( "SetInventory", GameCore.GetInventory(), SendMessageOptions.DontRequireReceiver );

		if ( item.category == "Weapon" && ( item.subcategory == "OneHanded" || item.subcategory == "TwoHanded" ) ) {
			ResetFire();
		
			GameCamera.GetInstance().controller.LockFirstPerson ();
		
		} else {

			GameCamera.GetInstance().controller.Unlock ();
		}
	}
	
	function IsEquippedWeapon () : boolean {
		//if ( InventoryManager.GetInstance().equippedItem ) {
	//		return InventoryManager.GetInstance().equippedItem.GetComponent(Item).type == eItemType.Weapon;
	//	} else {
			return false;
	//	}
	}
	
	function IsEquippedLockpick () : boolean {
		//if ( InventoryManager.GetInstance().equippedItem ) {
	//		return InventoryManager.GetInstance().equippedItem.GetComponent(Item).subType == eItemSubType.Lockpick;
	//	} else {
			return false;
	//	}
	}
	
	
	////////////////////
	// Fighting
	////////////////////
	function ResetFire () {
		shootTimer = 0;
	}
	
	private function SetRagdoll ( state : boolean ) {
		for ( var c : Collider in this.GetComponentsInChildren.< Collider > () ) {
			c.enabled = state;

			if ( c.rigidbody ) {
				c.rigidbody.isKinematic = !state;
			}
		}

		if ( this.GetComponent.< CharacterController > () ) {
			this.GetComponent.< CharacterController > ().enabled = !state;
		}

		if ( this.GetComponent.< Animator > () ) {
			this.GetComponent.< Animator > ().enabled = !state;
		}
	}

	function Die () {
		stats.hp = 0;

		GameCore.GetEventManager().OnDeath ();
		this.gameObject.layer = 2;

		SetRagdoll ( true );
	}
	
	function TakeDamage ( amount : int ) {
		stats.hp -= amount;
	
		if ( stats.hp <= 0 ) {
			Die ();
		}
	}
	
	public function Shoot () {
		var cam : Camera = Camera.main;
		var ray : Ray = cam.ScreenPointToRay ( new Vector3 ( Screen.width/2, Screen.height/2, 0 ) );
		var hit : RaycastHit;
		var range : float = 1000;
		var target : Vector3 = cam.transform.position + ray.direction * range;

		if ( Physics.Raycast ( ray, hit, range ) ) {
			target = hit.point;
		}

		Shoot ( target );
	}

	public function Shoot ( target : Vector3 ) {
		if ( equippedObject == null ) { return; }
		
		switch ( equippedObject.category ) {
			case "Weapon":	
				switch ( equippedObject.subcategory ) {
					// Mines
					case "Throwable":
						if ( shootTimer <= 0 ) {
							var hit : RaycastHit;

							var grenade : OSGrenade = equippedObject.GetComponent.< OSGrenade > ();
							grenade.eventHandler = GameCore.GetEventManager().gameObject;
							grenade.Throw ();
							shootTimer = equippedObject.GetAttribute ( "fireRate" );

							equippedObject = null;
						}
						break;

					// Bullets
					case "OneHanded": case "TwoHanded":
						var firearm : OSFirearm = equippedObject.GetComponent.< OSFirearm > ();

						if ( firearm ) {
							firearm.Fire ();
						}

						break;
				}
				
				break;
		}	
	}
	
	
	////////////////////
	// Upgrades
	////////////////////
	// Cloak
	public function SetInvisible ( state : boolean ) {
		var renderer : SkinnedMeshRenderer = this.GetComponentInChildren.< SkinnedMeshRenderer > ();

		if ( state ) {
			this.gameObject.layer = 2;
			
			var shader : Shader = Shader.Find ( "Vongott/XRay" );

			for ( var m : Material in renderer.materials ) {
				m.shader = shader;
				m.SetFloat ( "_Rim", 0.1 );
			}		

		} else {
			this.gameObject.layer = 0;
			
			shader = Shader.Find ( "Bumped Diffuse" );

			for ( m in renderer.materials ) {
				m.shader = shader;
			}		

		}
	}
	
	// Shield
	public function StartShield () {
		shield = Instantiate ( shieldPrefab ) as GameObject;
		shield.transform.parent = this.transform;
		shield.transform.localPosition = new Vector3 ( 0, 1, 0 );
		shield.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
	}
	
	public function StopShield () {
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
	
	function Heal ( amount : int ) {
		if ( stats.hp < stats.maxHp ) {
			stats.hp += amount;
		}
		
		if ( stats.hp >= stats.maxHp ) {
			stats.hp = stats.maxHp;

			skillTree.SetActive ( "Chest", "Health", false );
		}
	}
	
	public function OnProjectileHit ( damage : float ) {
		TakeDamage ( damage );
	}


	////////////////////
	// Init
	////////////////////	
	public function Start () {
		SetRagdoll ( false );

		inventory.eventHandler = this.gameObject;
	}

	////////////////////
	// Update
	////////////////////	
	function Update () {
		if ( stats.hp <= 0 ) { return; }
		
		// Lifting object
		if ( liftedObject ) {
			liftedObject.transform.rotation = this.transform.rotation;
			liftedObject.transform.position = this.transform.position + new Vector3 ( 0, 0.8, 0 ) + this.transform.forward;
		}
		
		// Shoot timer
		if ( shootTimer > 0 ) {
			shootTimer -= Time.deltaTime;
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
		if ( !controller ) {
			controller = this.GetComponent.< PlayerController >();
		}
		
		switch ( controller.actionState ) {
			case ePlayerActionState.Shooting:
				Shoot ();
				break;
		}

		switch ( controller.bodyState ) {
			case ePlayerBodyState.Crouching:
			//	collider.height = 1;
				break;
			
			default:
			//	collider.height = 1.8;
				break;
		}

		// Calculate energy cost
		stats.mp -= skillTree.GetTotalMPCost () * Time.deltaTime;
	
		if ( stats.mp <= 0 ) {
			stats.mp = 0;
			skillTree.SetActiveAll ( false );
		}

		// Check if aiming
		if ( equippedObject && equippedObject.GetComponent.< OSGrenade > () ) {
			equippedObject.GetComponent.< OSGrenade >().Aim ( Camera.main.transform.position, Camera.main.transform.forward );
		}
	}
}
