#pragma strict

import System.Collections.Generic;

////////////////////
// Prerequisites
////////////////////
// Slots
static var slots = Dictionary.<Upgrade.Slots, Entry>();

////////////////////
// Static functions
////////////////////
// Init
static function Init () {
	slots.Add ( Upgrade.Slots.Hands, null );
	slots.Add ( Upgrade.Slots.Arms, null );
	slots.Add ( Upgrade.Slots.Skull, null );
	slots.Add ( Upgrade.Slots.Legs, null );
	slots.Add ( Upgrade.Slots.Chest, null );
	slots.Add ( Upgrade.Slots.Back, null );
	slots.Add ( Upgrade.Slots.Feet, null );
}

// Install entry
static function InstallEntry ( entry : Entry, install : boolean ) {
	var player : Player = GameCore.GetPlayerObject().GetComponent(Player);
	
	// if there is already an entry installed, uninstall it first
	if ( install ) {
		if ( slots[entry.upgSlot] != null ) {
			player.Install ( entry, false );
		}
	}
	
	player.Install ( entry, install );
}