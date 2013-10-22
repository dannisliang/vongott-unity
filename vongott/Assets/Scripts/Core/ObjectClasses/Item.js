#pragma strict

// Types
public enum eItemType {
	Weapon,
	Tool,
	Consumable,
	Upgrade
}

// Attributes
public enum eItemAttribute {
	Damage,
	Defence,
	FireRate,
	FireRange,
	Accuracy,
	ReloadSpeed,
	RunningSpeed,
	SwimmingSpeed,
	MeleeAttack,
	Cloak,
	Energy
}

// IDs
public enum eItemID {
	// Weapons
	Pistol = 0,
	Baton,
	Tazer,
	AssaultRifle,
	DartGun,
	Vest,
	Boots,
	
	// Tools
	Lockpick = 500,
	
	// Consumables
	RiceCake = 1000,
	SoyMilk,
	Sandwich,
	HealthKit,
	Battery,
	
	// Upgrades
	MechanicalUpgrade = 1500,
	BiologicalUpgrade
}

class Item extends InteractiveObject {
	// Subclasses
	public class Attribute {
		var type = eItemAttribute.Damage;
		var val = 0.0;
	}
		
	// Public vars
	public var prefabPath : String;
	public var canDrop : boolean = true;
	public var type : eItemType;
	public var id : eItemID;
	public var image : Texture2D;
	public var title : String;
	public var desc : String;
	public var attr : Attribute[];

	// Init
	function Start () {
		if ( EditorCore.running ) {
			Destroy ( this.rigidbody );			
		}
	}

	// Handle pick-up
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Pick up [LeftMouse]" );
	}
	
	override function Interact () {
		if ( Input.GetMouseButton(0) ) {
			InventoryManager.AddItem(this);
			Destroy ( this.gameObject );
			GameCore.SetInteractiveObject ( null );
			UIHUD.ShowNotification ( "" );
		}
	}
}