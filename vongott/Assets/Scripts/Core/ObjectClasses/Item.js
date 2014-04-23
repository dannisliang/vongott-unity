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
public enum eItemSubType {
	// Weapons
	OneHanded = 0,
	TwoHanded,
	Melee,

	// Tools
	Lockpick = 500,
	
	// Consumables
	Food = 1000,
	Medicine,
	Battery,

	// Upgrades
	Mechanical = 1500,
	Biological,

	// Explosives
	Mine = 2000
}

class Item extends InteractiveObject {
	public class Attribute {
		var type = eItemAttribute.Damage;
		var val = 0.0;
	}
		
	public var canDrop : boolean = true;
	public var isStackable : boolean = true;
	public var type : eItemType;
	public var subType : eItemSubType;
	public var image : Texture2D;
	public var attr : Attribute[];

	public function get title () : String { return this.GetComponent ( Prefab ).title; }
	public function get desc () : String { return this.GetComponent ( Prefab ).description; }

	function Start () {
		if ( EditorCore.running ) {
			Destroy ( this.rigidbody );			
		}
	}

	override function InvokePrompt () {
		UIHUD.GetInstance().ShowNotification ( "Pick up" );
	}

	// Handle pick-up	
	override function Interact () {
		GameCore.GetInventory().AddItem(this.GetComponent.<OSItem>());
		Destroy ( this.gameObject );
		GameCore.SetInteractiveObject ( null );
		UIHUD.GetInstance().ShowNotification ( "" );
	}
}
