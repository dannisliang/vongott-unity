#pragma strict

class Player extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	public var head : Transform;
	public var hand : Transform;
	
	public var controller : PlayerController;

	public var energy : float = 100;
	public var health : int = 100;
	
	public var automaticHeal : int = 0;
	public var shieldPrefab : GameObject;
	
	public var talkingTo : Actor;

	public var inventory : OSInventory;

	// Private vars	
	private var shield : GameObject;
	private var liftedObject : LiftableItem;
	private var equippedObject : OSItem;
	private var shootTimer : float = 0;
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
		GameCore.GetInstance().SetControlsActive ( false );
		
		talkingTo = a;
		
		this.GetComponent(Animator).SetFloat ( "DeltaVertical", 0 );
		this.GetComponent(Animator).SetFloat ( "DeltaHorizontal", 0 );
		this.GetComponent(Animator).SetFloat ( "DeltaCombined", 0 );
		
		GameCore.Print ( "Player | conversation with " + a.displayName + " started" ); 
	}
	
	function StopTalking () {
		GameCore.Print ( "Player | conversation with " + talkingTo.displayName + " ended" ); 
		
		talkingTo = null;
	
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
	
	function GetEquipmentAttribute ( a : eItemAttribute ) : float {
		return 100;
	}
	
	////////////////////
	// Fighting
	////////////////////
	function ResetFire () {
		shootTimer = 0;
	}
	
	function Die () {
	
	}
	
	function CanHeal ( amount : int ) : boolean {
		return health + amount <= GameCore.GetUpgradeManager().GetAbility ( "Max Health" );
	}
	
	function TakeDamage ( amount : int ) {
		health -= amount;
	
		GameCore.Print ( "Player | Damage taken: " + amount );
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
							shootTimer = equippedObject.GetAttribute ( "fireRate" );
						
							equippedObject.GetComponent.< OSGrenade >().Throw ( GameCamera.GetInstance().transform.forward * 10 );
						}
						break;

					// Bullets
					case "OneHanded":
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
		return health == GameCore.GetUpgradeManager().GetAbility ( "Max Health" );
	}
	
	function Heal ( amount : int ) {
		if ( CanHeal ( amount ) ) {
			health += amount;
		
		} else if ( !HasFullHealth() ) {
			health = GameCore.GetUpgradeManager().GetAbility ( "Max Health" );
		
		} else {
			GameCore.GetUpgradeManager().Deactivate ( "Chest" );
			return;
			
		}
	
		GameCore.Print ( "Player | Healing: " + health );
	}
	
	
	////////////////////
	// Init
	////////////////////	
	public function Start () {
		inventory.eventHandler = this.gameObject;
	}

	////////////////////
	// Update
	////////////////////	
	function Update () {
		// Lifting object
		if ( liftedObject ) {
			liftedObject.transform.rotation = this.transform.rotation;
			liftedObject.transform.position = head.position + this.transform.forward;
		}
		
		// Talking
		if ( talkingTo != null ) {
			TurnTowards ( talkingTo.transform.position );
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
		energy -= GameCore.GetUpgradeManager().CalculateEnergyCost() * Time.deltaTime;
	
		if ( energy <= 0 ) {
			energy = 0;
			GameCore.GetUpgradeManager().DeactivateAll ();
		}
	}
}
