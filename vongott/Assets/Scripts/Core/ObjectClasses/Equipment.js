#pragma strict

public enum eEquipmentSlot {
	Hands,
	Torso,
	Legs,
	Head
}

class Equipment extends Item {
	// Public vars
	var eqSlot : eEquipmentSlot;
}