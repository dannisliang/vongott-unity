#pragma strict

class Equipment extends Item {
	enum eEquipmentSlot {
		Hands,
		Torso,
		Legs,
		Head
	}
	
	// Public vars
	var eqSlot : eEquipmentSlot;
}