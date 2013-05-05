#pragma strict

class Item extends InteractiveObject {
	// Types
	enum Types {
		Equipment,
		Consumable,
		Upgrade
	}
	
	// Attributes
	enum Attributes {
		Damage,
		Defence,
		FireRate,
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
	enum IDs {
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
		DigitalUpgrade
	}
	
	// Subclasses
	class Attribute {
		var type = Attributes.Damage;
		var val = 0.0;
	}
		
	// Public vars
	var type : Types;
	var id : IDs;
	var image : Texture2D;
	var title : String;
	var desc : String;
	var attr : Attribute[];

	// Prefab path
	var model : String;

	// Handle pick-up
	function Update () {
		if ( GameCore.GetInteractiveObject() == this.gameObject ) {
			UIHUD.ShowNotification ( "Pick up [F]" );
			
			if ( Input.GetKeyDown(KeyCode.F) ) {
				InventoryManager.AddItem(this);
				Destroy ( this.gameObject );
				GameCore.SetInteractiveObject ( null );
				UIHUD.ShowNotification ( "" );
			}
		}
	}
}