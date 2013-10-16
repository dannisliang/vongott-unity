#pragma strict

class Upgrade extends Item {
	// Classes
	public class Ability {
		var id : eAbilityID;
		var val : float;
	}
	
	// Public vars
	var upgSlot : UpgradeManager.eSlotID;
	var ability : Ability;	
}