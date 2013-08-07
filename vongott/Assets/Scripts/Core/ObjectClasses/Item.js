#pragma strict

@script ExecuteInEditMode();

class Item extends InteractiveObject {
	// Types
	enum eItemType {
		Equipment,
		Consumable,
		Upgrade
	}
	
	// Attributes
	enum eItemAttribute {
		Damage,
		Defence,
		FireRate,
		FireRange,
		Accuracy,
		ReloadSpeed,
		RunningSpeed,
		SwimmingSpeed,
		JumpingHeight,
		NoiseReduction,
		Hacking,
		AutoAim,
		LockPicking,
		MeleeAttack,
		Cloak,
		WallRunning,
		Takedown
	}
	
	// IDs
	enum eItemID {
		// equipment
		Pistol,
		Baton,
		Tazer,
		AssaultRifle,
		DartGun,
		Vest,
		Boots,
		// consumables
		RiceCake,
		SoyMilk,
		Sandwich,
		HealthKit,
		// upgrades
		MechanicalUpgrade,
		BiologicalUpgrade
	}
	
	// Subclasses
	public class Attribute {
		var type = eItemAttribute.Damage;
		var val = 0.0;
	}
		
	// Public vars
	var prefabPath : String;
	var type : eItemType;
	var id : eItemID;
	var image : Texture2D;
	var title : String;
	var desc : String;
	var attr : Attribute[];

	// Handle pick-up
	override function InvokePrompt () {
		UIHUD.ShowNotification ( "Pick up [F]" );
	}
	
	override function Interact () {
		if ( Input.GetKeyDown(KeyCode.F) ) {
			InventoryManager.AddItem(this);
			Destroy ( this.gameObject );
			GameCore.SetInteractiveObject ( null );
			UIHUD.ShowNotification ( "" );
		}
	}
}