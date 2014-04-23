#pragma strict

import System.Collections.Generic;
import System.Enum;

public enum eAbilityID {
	// Mechanical
	Reflexes = 0,
	Speed,
	Heal,
	Punch,
	Lift,
	Aim,
	Silence, 
	Parachute,
	Cloak,
	XRay,
	Shield,
	
	// Biological
	Lockpicking = 100,
	ReloadSpeed,
	Aiming,
	Hacking,
	MaxHealth
}

// Slots
public enum eSlotID {
	Skull,
	Eyes,
	Torso,
	Abdomen,
	Legs,
	Back,
	Arms
}

class UpgradeManager {
	////////////////////
	// Prerequisites
	////////////////////
	static var slots : Dictionary.< eSlotID, OSSlot > = new Dictionary.< eSlotID, OSSlot > ();
	static var abilities : Dictionary.< eAbilityID, int > = new Dictionary.< eAbilityID, int > ();
		
	////////////////////
	// Effects
	////////////////////
	// Healing
	static function UseHealing ( isActive : boolean, amount : int ) {
		if ( isActive ) {
			GameCore.GetPlayer().StartAutoHeal ( amount );
		} else {
			GameCore.GetPlayer().StopAutoHeal ();
		}
	}
	
	// Shield
	static function UseShield ( isActive : boolean, level : int ) {
		if ( isActive ) {
			GameCore.GetPlayer().StartShield ( level );
		} else {
			GameCore.GetPlayer().StopShield ();
		}
	}
	
	
	////////////////////
	// Management
	////////////////////
	// Init
	static function Init () {
		slots.Add ( eSlotID.Skull, null );
		slots.Add ( eSlotID.Eyes, null );
		slots.Add ( eSlotID.Torso, null );
		slots.Add ( eSlotID.Abdomen, null );
		slots.Add ( eSlotID.Legs, null );
		slots.Add ( eSlotID.Back, null );
		slots.Add ( eSlotID.Arms, null );
		
		abilities.Add ( eAbilityID.Lockpicking, 0 );
		abilities.Add ( eAbilityID.ReloadSpeed, 0 );
		abilities.Add ( eAbilityID.Aiming, 0 );
		abilities.Add ( eAbilityID.Hacking, 0 );
		abilities.Add ( eAbilityID.MaxHealth, 100 );
	}
	
	// Because System.Enum.Parse isn't type safe in UnityScript *grumble grumble*
	static function GetEnum ( s : String ) : eSlotID {
		var e : eSlotID;
		
		if ( s == "Eyes" ) { e = eSlotID.Eyes; }
		else if ( s == "Torso" ) { e = eSlotID.Torso; }
		else if ( s == "Abdomen" ) { e = eSlotID.Abdomen; }
		else if ( s == "Legs" ) { e = eSlotID.Legs; }
		else if ( s == "Arms" ) { e = eSlotID.Arms; }
		else if ( s == "Back" ) { e = eSlotID.Back; }
		else if ( s == "Skull" ) { e = eSlotID.Skull; }
				
		return e;
	}
	
	// Clear
	static function Clear () {
		slots.Clear ();
	}
	
	// Is active?
	static function IsActive ( slot : eSlotID ) : boolean {
		if ( slots [ slot ] ) {
			return slots [ slot ].equipped;
		} else {
			return false;
		}
	}
	
	// Get upgrade
	static function GetUpgrade ( slot : eSlotID ) : OSSlot {
		return slots [ slot ];
	}
	
	static function GetUpgrade ( slot : String ) : OSSlot {
		var s : eSlotID = GetEnum ( slot );
		return slots [ s ];
	}
	
	static function GetUpgradeName ( slot : eSlotID ) : String {
		if ( slots[slot] ) {
			return slots[slot].item.id;
		} else {
			return "";
		}
	}
	
	static function GetUpgradeName ( slot : String ) : String {
		var s : eSlotID = GetEnum ( slot );
				
		if ( slots[s] ) {
			return slots [ s ].item.id;
		} else {
			return "";
		}
	}
	
	// Get slots
	static function GetSlots () : Dictionary.< eSlotID, OSSlot > {
		return slots;
	}
	
	// Energy cost
	static function CalculateEnergyCost () : int {
		var totalCost : int = 0;
		
		for ( var s : OSSlot in slots.Values ) {
			if ( s && s.equipped ) {
				totalCost += s.item.GetAttribute ( "drain" );
			}
		}
		
		return totalCost;
	}
	
	// Deactivate
	static function DeactivateAll () {
		for ( var s : eSlotID in slots.Keys ) {
			Deactivate ( s );
		}
	}
	
	static function Deactivate ( slot : eSlotID ) {
		if ( slots [ slot ] == null ) {
			return;
			
		}
		
		SFXManager.GetInstance().Play ( "sfx_actor_aug_off", GameCore.GetPlayer().audio );
		
		slots [ slot ].equipped = false;
		
		var upgrade : Upgrade = slots [ slot ].item as Upgrade;
				
		switch ( upgrade.ability.id ) {
			case eAbilityID.Reflexes:
				GameCore.GetInstance().SetTimeScaleGoal ( 1.0 );
				break;
				
			case eAbilityID.Speed:
//				GameCore.GetPlayerObject().GetComponent(PlayerController).speedModifier = 1.0;
				break;
				
			case eAbilityID.XRay:
				GameCamera.GetInstance().SetXRay ( false, 0 );
				break;
				
			case eAbilityID.Heal:
				UseHealing ( false, 0 );
				break;
				
			case eAbilityID.Shield:
				UseShield ( false, 0 );
				break;
		}
		
		GameCore.Print ( "UpgradeManager | D.equipped " + upgrade.title );
	}
	
	// Remove
	static function Remove ( slot : eSlotID ) {
		Deactivate ( slot );
		
		GameCore.Print ( "UpgradeManager | removed upgrade from slot " + slot );
	
		slots [ slot ] = null;
	}
	
	// Set ability
	static function IncrementAbility ( id : eAbilityID, n : int ) {
		abilities [ id ] += n;
	}
	
	static function SetAbility ( id : eAbilityID, n : int ) {
		abilities [ id ] = n;
	}
	
	// Get ability
	static function GetAbility ( id : eAbilityID ) : int {
		return abilities [ id ];
	}
	
	// Install
	static function Install ( upgrade : Upgrade ) {
		if ( ( upgrade as Item ).subType == eItemSubType.Biological ) {
			IncrementAbility ( upgrade.ability.id, upgrade.ability.value );
		
		} else {
			if ( slots [ upgrade.upgSlot ] ) {
				Deactivate ( upgrade.upgSlot );
				Remove ( upgrade.upgSlot );
			}
			
//			slots [ upgrade.upgSlot ] = new OSSlot ( upgrade );
						
			GameCore.Print ( "UpgradeManager | installed upgrade " + upgrade.title + " in " + upgrade.upgSlot );
		
		}
	}
	
	// Activate
	static function Activate ( slot : eSlotID ) {
		if ( !slots.ContainsKey ( slot ) ) {
			return;
			
		} else {
			SFXManager.GetInstance().Play ( "sfx_actor_aug_on", GameCore.GetPlayer().audio );

			if ( IsActive ( slot ) ) {
				Deactivate ( slot );
				return;
			}
		}
		
		var upgrade : Upgrade = slots [ slot ].item as Upgrade;
		
		slots[slot].equipped = true;
		
		switch ( upgrade.ability.id ) {
			case eAbilityID.Reflexes:
				GameCore.GetInstance().SetTimeScaleGoal ( upgrade.ability.value );
				break;
				
			case eAbilityID.Speed:
//				GameCore.GetPlayerObject().GetComponent(PlayerController).speedModifier = upgrade.ability.value;
				break;
				
			case eAbilityID.XRay:
				GameCamera.GetInstance().SetXRay ( true, upgrade.ability.value );
				break;
		
			case eAbilityID.Heal:
				UseHealing ( true, upgrade.ability.value );
				break;
				
			case eAbilityID.Shield:
				UseShield ( true, upgrade.ability.value );
				break;
		}
		
		GameCore.Print ( "UpgradeManager |.equipped " + upgrade.title );
	}
	
	static function Activate ( slot : String ) {
		Activate ( GetEnum ( slot ) );
	}	
}
