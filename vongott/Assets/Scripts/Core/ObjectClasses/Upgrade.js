#pragma strict

class Upgrade extends Item {
	// Private classes
	private class Ability {
		var id : eAbilityID;
		var value : float = 0;
	}
	
	// Public vars
	var upgSlot : eSlotID;
	var ability : Ability;
	var cost : int = 0;
}