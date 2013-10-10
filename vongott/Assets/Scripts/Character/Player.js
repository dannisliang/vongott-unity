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
	var equippedItem : GameObject;

	@HideInInspector var shootTimer : float = 0;
	@HideInInspector var talkingTo : Actor;
	
	private var liftedObject : LiftableItem;
	
					
	////////////////////
	// Public functions
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
		
		GameCamera.GetInstance().SetBlur ( true );
		GameCamera.GetInstance().BlurFocus ( a.transform );
		
		GameCore.Print ( "Player | conversation with " + a.displayName + " started" ); 
	}
	
	function StopTalking () : IEnumerator {
		GameCore.Print ( "Player | conversation with " + talkingTo.displayName + " ended" ); 
		
		talkingTo = null;
		GameCamera.GetInstance().SetBlur ( false );
		GameCamera.GetInstance().BlurFocus ( null );
	
		yield WaitForSeconds ( 1 );
		
		GameCore.ToggleControls ( true );
	}
	
	// Picking up / dropping objects
	function PickUpObject ( obj : LiftableItem ) {
		liftedObject = obj;
	}
	
	function DropObject () {
		liftedObject = null;
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
			equippedItem.GetComponent(SphereCollider).enabled = false;
			equippedItem.GetComponent ( DontGoThroughThings ).enabled = false;
			Destroy ( equippedItem.rigidbody );
		
			ResetFire();
		
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
	
	function GetEquipmentAttribute ( a : Item.eItemAttribute ) : float {
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
		shootTimer = GetEquipmentAttribute ( Item.eItemAttribute.FireRate );
	}
	
	function TakeDamage ( amount : float ) {
		GameCore.Print ( "Player | Damage taken: " + amount );
	}
	
	function Shoot ( target : Vector3 ) {
		if ( shootTimer >= GetEquipmentAttribute ( Item.eItemAttribute.FireRate ) ) {
			shootTimer = 0;
		
			var accuracyDecimal : float = 1.0 - ( GetEquipmentAttribute ( Item.eItemAttribute.Accuracy ) / 100 );
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
	
	// Install
	function Install ( upg : Upgrade, install : boolean ) {
		if ( install ) {
			UpgradeManager.Install ( upg );
		} else {
			UpgradeManager.Remove ( upg.upgSlot );
		}
	}
	
	function Start () {
		
	}
		
	function Update () {
		if ( liftedObject ) {
			liftedObject.transform.rotation = this.transform.rotation;
			liftedObject.transform.position = torso.transform.position + this.transform.forward;
		}
		
		if ( talkingTo != null ) {
			TurnTowards ( talkingTo.transform.position );
		}
		
		if ( equippedItem ) {	
			if ( shootTimer < GetEquipmentAttribute ( Item.eItemAttribute.FireRate ) ) {
				shootTimer += Time.deltaTime;
			}
			
		}
	}
}