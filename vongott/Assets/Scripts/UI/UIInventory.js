#pragma strict

import System.Text.RegularExpressions;

private class Inspector {
	var entryName : OGLabel;
	var description : OGLabel;
	var attrName : OGLabel;
	var attrVal : OGLabel;
}

private class InspectorButtons {
	var equip : GameObject;
	var discard : GameObject;
}

class UIInventory extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var grid : Transform;
	var inspector : Inspector;
	var buttons : InspectorButtons;
	
	// Private vars
	@HideInInspector private var selectedEntry : InventoryEntry;
	
	
	////////////////////
	// Inventory display
	////////////////////
	// Clear grid
	function ClearGrid () {
		for ( var i = 0; i < grid.childCount; i++ ) {
			grid.GetChild ( i ).GetChild(0).GetComponent(MeshRenderer).material.mainTexture = null;
			grid.GetChild ( i ).GetChild(0).gameObject.SetActive ( false );
		}
	}
	
	// Populate grid
	function PopulateGrid () {
		ClearGrid ();
		
		var allSlots : Dictionary.< int, InventoryEntry > = InventoryManager.GetSlots();
		
		var col = 0;
		var row = 0;
		
		for ( var i = 0 ; i < InventoryManager.capacity; i++ ) {
			if ( allSlots[i] ) {
				var item : Item = allSlots[i].GetItem();
				grid.GetChild(i).GetChild(0).gameObject.SetActive ( true );
				grid.GetChild(i).GetChild(0).GetComponent(MeshRenderer).material.mainTexture = item.image;
			}
		}
	}
	
	// Select slot
	function SelectSlot ( b : OGButton3D ) {
		var index : int = int.Parse ( b.gameObject.name );
		var allSlots : Dictionary.< int, InventoryEntry > = InventoryManager.GetSlots();
				
		if ( allSlots[index] ) {
			var entry = allSlots[index];
			var item = allSlots[index].GetItem();
		
			inspector.entryName.text = item.title;
			inspector.description.text = item.desc;
			inspector.attrName.text = "";
			inspector.attrVal.text = "";
			
			for ( var a : Item.Attribute in item.attr ) {
				inspector.attrName.text += a.type.ToString() + ": \n";
				inspector.attrVal.text += a.val.ToString() + "\n";
			}
			
			if ( item.type == Item.eItemType.Equipment ) {
				if ( !entry.equipped ) {
					SetButtons ( "Discard", "Equip" );
				} else {
					SetButtons ( null, "Unequip" );
				}
			} else if ( item.type == Item.eItemType.Upgrade ) {
				if ( !entry.installed ) {
					SetButtons ( "Discard", "Install" );
				} else {
					SetButtons ( null, "Uninstall" );
				}
			} else {
				SetButtons ( null, null );
			}
			
			selectedEntry = entry;
		}
	}
	
	
	////////////////////
	// Action buttons
	////////////////////
	// Equip entry
	private function Equip ( entry : InventoryEntry, equip : boolean ) {
		entry.equipped = equip;
		
		var item : Item = entry.GetItem();
		
		InventoryManager.Equip ( item, equip );
	}
	
	// Install entry
	private function Install ( entry : InventoryEntry, install : boolean ) {
		entry.installed = install;
		
		var upgrade : Upgrade = entry.GetItem() as Upgrade;
		
		if ( install ) {
			UpgradeManager.Install ( upgrade );
		} else {
			UpgradeManager.Remove ( upgrade.upgSlot );
		}
	}
	
	// Set buttons
	function SetButtons ( btn1 : String, btn2 : String ) {
		/*if ( btn1 != null ) {
			buttons.discard.SetActive ( true );
			buttons.discard.GetComponent(OGButton).text = btn1;
		} else {
			buttons.discard.SetActive ( false );
		}
		
		if ( btn2 != null ) {
			buttons.equip.SetActive ( true );
			buttons.equip.GetComponent(OGButton).text = btn2;
		} else {
			buttons.equip.SetActive ( false );
		}*/
	}
	
	// Equip button
	function BtnEquip () {
		if ( selectedEntry.prefabPath.Contains ( "Equipment" ) ) {
			if ( !selectedEntry.equipped ) {
				Equip ( selectedEntry, true );
				SetButtons ( null, "Unequip" );
			} else {
				Equip ( selectedEntry, false );
				SetButtons ( "Discard", "Equip" );
			}
	
		} else if ( selectedEntry.prefabPath.Contains ( "Upgrade" ) ) {
			if ( !selectedEntry.installed ) {
				Install ( selectedEntry, true );
				SetButtons ( null, "Uninstall" );
			} else {
				Install ( selectedEntry, false );
				SetButtons ( "Discard", "Install" );
			}
		}
	}
	
	// Discard button
	function BtnDiscard () {
		/*InventoryManager.RemoveEntry ( selected_entry );
		ResetInspector ();
		ClearGrid ();
		PopulateGrid ();*/
	}
	
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		ClearGrid ();
		GameCore.GetInstance().SetPause ( true );
		PopulateGrid ();
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.I) ) {
			OGRoot.GoToPage ( "HUD" );
			GameCore.ToggleControls ( true );
		}
	}
}