#pragma strict

class Upgrade extends Item {
	enum Slots {
		Hands,
		Arms,
		Skull,
		Legs,
		Chest,
		Back,
		Feet
	}
	
	// Public vars
	var upgSlot : Slots;
}