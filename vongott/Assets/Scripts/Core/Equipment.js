#pragma strict

class Equipment extends Item {
	enum Slots {
		Hands,
		Torso,
		Legs,
		Head
	}
	
	// Public vars
	var eqSlot : Slots;
}