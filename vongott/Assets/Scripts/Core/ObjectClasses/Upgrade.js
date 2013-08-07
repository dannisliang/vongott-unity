#pragma strict

class Upgrade extends Item {
	// Enums
	enum eAbilityID {
		Reflexes,
		Speed,
		Health,
		Strength,
		Aim,
		Silence, 
		Parachute,
		Cloak
	}
	
	// Classes
	public class Ability {
		var id : eAbilityID;
		var val : float;
	}
	
	// Public vars
	var upgSlot : UpgradeManager.eSlotID;
	var ability : Ability;	
	var activated : boolean = false;
	var installed : boolean = false;
}