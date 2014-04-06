#pragma strict

public enum eEquipmentSlot {
	Hands,
	Torso,
	Legs,
	Head
}

class Equipment extends Item {
	public var eqSlot : eEquipmentSlot;
	public var equipSound : AudioClip;
	public var fireSounds : AudioClip [] = new AudioClip[0];
}
