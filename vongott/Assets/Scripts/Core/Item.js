class Item extends InteractiveObject {
	// Enums
	enum Types {
		Equipment,
		Consumable
	}
	
	enum IDs {
		Pistol,
		Baton,
		Tazer,
		AssaultRifle,
		DartGun,
		Vest,
		Boots
	}
	
	enum Attributes {
		Damage,
		Defence,
		FireRate,
		ReloadSpeed,
		Agility
	}
	
	enum EquipmentSlots {
		Hands,
		Torso,
		Legs,
		Head
	}
	
	class Attribute {
		var type = Attributes.Damage;
		var val = 0.0;
	}
	
	var type = Types.Equipment;
	var id = IDs.Pistol;
	var eqSlot = EquipmentSlots.Hands;
	var spriteName = "";
	var title = "";
	var desc = "";
	var attr : Attribute[];

	function Update () {
		if ( HUD.showing && GameCore.GetInteractiveObject() == this.gameObject ) {
			if ( !HUD.notification.active ) {
				HUD.ShowNotification ( "Pick up [F]" );
			}
			
			if ( Input.GetKeyDown(KeyCode.F) ) {
				InventoryManager.AddItem(this);
				Destroy ( this.gameObject );
				GameCore.SetInteractiveObject ( null );
				HUD.ShowNotification ( "" );
			}
		}
	}
}