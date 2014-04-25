#pragma strict

import System.Collections.Generic;
import System.Enum;

public enum eUpgradeRegion {
	Arms,
	Back,
	Chest,
	Eyes,
	Feet,
	Hands,
	Legs,
	Skull
}

public class UpgradeSlot {
	public var item : OSItem;
	public var active : boolean = false;
	public var region : eUpgradeRegion;
}

public class UpgradeAbility {
	public var name : String;
	public var value : int;

	function UpgradeAbility () {

	}

	function UpgradeAbility ( name : String, value : float ) {
		this.name = name;
		this.value = value;
	}
}

public class UpgradeManager extends MonoBehaviour {
	public var slots : List.< UpgradeSlot > = new List.< UpgradeSlot > ();
	public var abilities : List.< UpgradeAbility > = new List.< UpgradeAbility > ();
	

	////////////////////
	// Effects
	////////////////////
	// Healing
	public function UseHealing ( isActive : boolean, amount : int ) {
		if ( isActive ) {
			GameCore.GetPlayer().StartAutoHeal ( amount );
		} else {
			GameCore.GetPlayer().StopAutoHeal ();
		}
	}
	
	// Shield
	public function UseShield ( isActive : boolean, level : int ) {
		if ( isActive ) {
			GameCore.GetPlayer().StartShield ( level );
		} else {
			GameCore.GetPlayer().StopShield ();
		}
	}
	
	
	////////////////////
	// Management
	////////////////////
	// Clear
	public function Clear () {
		slots.Clear ();
	}
	
	// Is active?
	public function IsActive ( id : String ) : boolean {
		for ( var i : int = 0; i < slots.Count; i++ ) {
			if ( slots[i].item && slots[i].item.id == id ) {
				return slots[i].active; 
			}
		}

		return false;
	}
	
	// Get upgrade
	public function GetUpgrade ( region : eUpgradeRegion ) : UpgradeSlot {
		for ( var i : int = 0; i < slots.Count; i++ ) {
			if ( slots[i].region == region ) {
				return slots[i]; 
			}
		}

		return null;
	}
	
	public function GetUpgrade ( id : String ) : UpgradeSlot {
		for ( var i : int = 0; i < slots.Count; i++ ) {
			if ( slots[i].item && slots[i].item.id == id ) {
				return slots[i]; 
			}
		}

		return null;
	}
	
	// Energy cost
	public function CalculateEnergyCost () : int {
		var totalCost : int = 0;
		
		for ( var s : UpgradeSlot in slots ) {
			if ( s && s.active ) {
				totalCost += s.item.GetAttribute ( "drain" );
			}
		}
		
		return totalCost;
	}
	
	// Deactivate
	public function DeactivateAll () {
		for ( var i : int = 0; i < slots.Count; i++ ) {
			slots[i].active = false;
		}
	}
	
	public function Deactivate ( slot : UpgradeSlot ) {
		if ( !slot ) {  return; }
		
		SFXManager.GetInstance().Play ( "sfx_actor_aug_off", GameCore.GetPlayer().audio );
		
		slot.active = false;
		/*
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
		
		GameCore.Print ( "UpgradeManager | D.equipped " + upgrade.title );*/
	}

	public function Deactivate ( region : eUpgradeRegion ) {
		Deactivate ( GetUpgrade ( region ) );		
	}

	public function Deactivate ( id : String ) {
		Deactivate ( GetUpgrade ( id ) );
	}
	
	// Activate
	public function Activate ( slot : UpgradeSlot ) {
		

	/*	
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
		
		GameCore.Print ( "UpgradeManager |.equipped " + upgrade.title );*/
	}
	
	public function Activate ( id : String ) {
		Activate ( GetUpgrade ( id ) );
	}
	
	public function Activate ( region : eUpgradeRegion ) {
		Activate ( GetUpgrade ( region ) );
	}

	// Abilities
	public function AddAbility ( name : String, value : int ) {
		for ( var i : int = 0; i < abilities.Count; i++ ) {
			if ( abilities[i].name == name ) {
				abilities[i].value += value;
				return;
			}
		}	

		// If ability doesn't exist, create it
		abilities.Add ( new UpgradeAbility ( name, value ) );
	}

	public function GetAbility ( name : String ) : int {
		for ( var i : int = 0; i < abilities.Count; i++ ) {
			if ( abilities[i].name == name ) {
				return abilities[i].value;
			}
		}

		return 0;
	}	

	// Remove
	public function Remove ( id : String ) {
		for ( var i : int = 0; i < slots.Count; i++ ) {
			if ( slots[i].item && slots[i].item.id == id ) {
				Deactivate ( slots[i] );
				slots.RemoveAt ( i );
			}
		}
	}
	
	// Install
	public function Install ( item : OSItem ) {
		if ( item.subcategory == "Mechanical" ) {
			

		} else if ( item.subcategory == "Biological" ) {
			for ( var i : int = 0; i < item.attributes.Length; i++ ) {
				AddAbility ( item.attributes[i].name, item.attributes[i].value );
			}

		}
	}
	
}
