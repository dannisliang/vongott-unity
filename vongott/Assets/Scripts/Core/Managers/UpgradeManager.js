#pragma strict

import System.Collections.Generic;

class UpgradeManager {
	////////////////////
	// Prerequisites
	////////////////////
	// Slots
	enum eSlotID {
		Skull,
		Eyes,
		Torso,
		Abdomen,
		Legs,
		Feet,
		Back,
		Arms
	}
	
	static var slots : Dictionary.< eSlotID, InventoryEntry > = new Dictionary.< eSlotID, InventoryEntry > ();
	
	////////////////////
	// Static functions
	////////////////////
	// Init
	static function Init () {
		slots.Add ( eSlotID.Skull, null );
		slots.Add ( eSlotID.Eyes, null );
		slots.Add ( eSlotID.Torso, null );
		slots.Add ( eSlotID.Abdomen, null );
		slots.Add ( eSlotID.Legs, null );
		slots.Add ( eSlotID.Feet, null );
		slots.Add ( eSlotID.Back, null );
		slots.Add ( eSlotID.Arms, null );
	}
	
	// Clear
	static function Clear () {
		slots.Clear ();
	}
	
	// Is active?
	static function IsActive ( slot : eSlotID ) : boolean {
		if ( slots [ slot ] ) {
			return slots [ slot ].activated;
		} else {
			return false;
		}
	}
	
	// Get upgrade by slot
	static function GetUpgrade ( slot : eSlotID ) : InventoryEntry {
		return slots [ slot ];
	}
	
	// Get slots
	static function GetSlots () : Dictionary.< eSlotID, InventoryEntry > {
		return slots;
	}
	
	// Deactivate
	static function Deactivate ( slot : eSlotID ) {
		if ( slots [ slot ] == null ) {
			return;
			
		}
		
		slots [ slot ].activated = false;
		
		var upgrade : Upgrade = slots [ slot ].GetItem() as Upgrade;
				
		switch ( upgrade.ability.id ) {
			case Upgrade.eAbilityID.Reflexes:
				GameCore.GetInstance().TweenTimeScale ( 0.1, 1.0, 1.0 );
					
				break;
				
			case Upgrade.eAbilityID.Speed:
				GameCore.GetPlayerObject().GetComponent(PlayerController).speedModifier = 1.0;
			
				break;
		}
	}
	
	// Remove
	static function Remove ( slot : eSlotID ) {
		GameCore.Print ( "UpgradeManager | removed upgrade from slot " + slot );
	
		slots [ slot ] = null;
	}
	
	// Install
	static function Install ( upgrade : Upgrade ) {
		if ( slots [ upgrade.upgSlot ] ) {
			Deactivate ( upgrade.upgSlot );
			Remove ( upgrade.upgSlot );
		}
		
		slots [ upgrade.upgSlot ] = new InventoryEntry ( upgrade );
					
		GameCore.Print ( "UpgradeManager | installed upgrade " + upgrade.title + " in " + upgrade.upgSlot );
	}
	
	// Activate
	static function Activate ( slot : eSlotID ) {
		if ( !slots.ContainsKey ( slot ) ) {
			return;
			
		} else if ( IsActive ( slot ) ) {
			Deactivate ( slot );
			return;
		
		} else if ( slots [ slot ] == null ) {
			return;
			
		}
		
		var upgrade : Upgrade = slots [ slot ].GetItem() as Upgrade;
		
		slots[slot].activated = true;
		
		switch ( upgrade.ability.id ) {
			case Upgrade.eAbilityID.Reflexes:
				GameCore.GetInstance().TweenTimeScale ( 1, upgrade.ability.val, 1.0 );
					
				break;
				
			case Upgrade.eAbilityID.Speed:
				GameCore.GetPlayerObject().GetComponent(PlayerController).speedModifier = upgrade.ability.val;
			
				break;
		}
	}
	
}