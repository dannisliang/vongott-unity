#pragma strict

import System.Collections.Generic;

class UpgradeManager {
	////////////////////
	// Prerequisites
	////////////////////
	// Slots
	static var slots = Dictionary.<Upgrade.Slots, Entry>();
	
	// Active upgrade
	static var activeUpgrades : List.<String> = new List.<String>();
	
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
	
	// Clear
	static function Clear () {
		slots.Clear ();
	}
	
	// Is active?
	static function IsActive ( upgrade : String ) : boolean {
		for ( var u : String in activeUpgrades ) {
			if ( u == upgrade ) {
				return true;
			}
		} 
		
		return false;
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
	
	// Deactivate
	static function DeactivateUpgrade ( upgrade : String ) {
		activeUpgrades.Remove ( upgrade );
		
		switch ( upgrade ) {
			case "Reflexes":
				GameCore.GetInstance().TweenTimeScale ( 0.1, 1.0, 1.0 );
					
				break;
				
			case "Speed":
				GameCore.GetPlayerObject().GetComponent(PlayerController).speedModifier = 1.0;
			
				break;
		}
	}
	
	// Activate
	static function Activate ( upgrade : String ) {
		if ( IsActive ( upgrade ) ) {
			DeactivateUpgrade ( upgrade );
			return;
		}
		
		activeUpgrades.Add ( upgrade );
		
		switch ( upgrade ) {
			case "Reflexes":
				GameCore.GetInstance().TweenTimeScale ( 1, 0.1, 1.0 );
					
				break;
				
			case "Speed":
				GameCore.GetPlayerObject().GetComponent(PlayerController).speedModifier = 10.0;
			
				break;
		}
	}
	
}