#pragma strict

import System.Text.RegularExpressions;

private class Inspector {
	var entryName : OGLabel;
	var description : OGLabel;
	var attrName : OGLabel;
	var attrVal : OGLabel;
}

class UIInventory extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var grid : Transform;
	var inspector : Inspector;
	
	var selectedMaterial : Material;
	var equippedMaterial : Material;
	var equippedSelectedMaterial : Material;
	var normalMaterial : Material;
	
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
			grid.GetChild(i).GetComponent(MeshRenderer).material = normalMaterial;
		}
	}
	
	// Populate grid
	function PopulateGrid () {
		ClearGrid ();
		
		var allSlots : Dictionary.< int, InventoryEntry > = InventoryManager.GetSlots();
		
		for ( var i = 0 ; i < InventoryManager.capacity; i++ ) {
			if ( allSlots[i] ) {
				var item : Item = allSlots[i].GetItem();
				grid.GetChild(i).GetChild(0).gameObject.SetActive ( true );
				grid.GetChild(i).GetChild(0).GetComponent(MeshRenderer).material.mainTexture = item.image;
			
				if ( allSlots[i].equipped || allSlots[i].installed ) {
					grid.GetChild(i).GetComponent(MeshRenderer).material = equippedMaterial;
				} else {
					grid.GetChild(i).GetComponent(MeshRenderer).material = normalMaterial;
				}
			}
		}
	}
	
	// Update text
	function UpdateText ( entry : InventoryEntry, button : OGButton3D ) {
		if ( entry == null ) {
			inspector.entryName.text = "";
			inspector.description.text = "";
			inspector.attrName.text = "";
			inspector.attrVal.text = "";
		
			return;
		}
		
		var item = entry.GetItem();
		var equipText : String = "";
		
		if ( entry.equipped ) {
			equipText = "\nEQUIPPED";
		} else if ( entry.installed ) {
			equipText = "\nINSTALLED";
		}
	
		inspector.entryName.text = item.title;
		inspector.description.text = item.desc + equipText;
		inspector.attrName.text = "";
		inspector.attrVal.text = "";
		
		for ( var a : Item.Attribute in item.attr ) {
			inspector.attrName.text += a.type.ToString() + ": \n";
			inspector.attrVal.text += a.val.ToString() + "\n";
		}
				
		if ( button ) {
			if ( entry.equipped || entry.installed ) {
				button.GetComponent(MeshRenderer).material = equippedSelectedMaterial;
			
			} else {
				button.GetComponent(MeshRenderer).material = selectedMaterial;
			
			}
		}
	}
	
	function UpdateText( entry : InventoryEntry ) {
		UpdateText ( entry, null );
	}
	
	// Select slot
	function SelectSlot ( b : OGButton3D ) {
		var index : int = int.Parse ( b.gameObject.name );
		var allSlots : Dictionary.< int, InventoryEntry > = InventoryManager.GetSlots();
		
		PopulateGrid ();
		
		UpdateText ( allSlots[index], b );
			
		selectedEntry = allSlots[index];
	}
	
	
	////////////////////
	// Action buttons
	////////////////////
	// Equip entry
	private function Equip ( entry : InventoryEntry, equip : boolean ) {
		entry.equipped = equip;
		
		var item : Item = entry.GetItem();
		
		InventoryManager.Equip ( item, equip );
		
		UpdateText ( entry );
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
		
		UpdateText ( entry );
	}
	
	// Equip button
	function BtnEquip () {
		if ( !selectedEntry ) { return; }
		
		if ( selectedEntry.prefabPath.Contains ( "Equipment" ) ) {
			if ( !selectedEntry.equipped ) {
				Equip ( selectedEntry, true );
			} else {
				Equip ( selectedEntry, false );
			}
	
		} else if ( selectedEntry.prefabPath.Contains ( "Upgrade" ) ) {
			if ( !selectedEntry.installed ) {
				Install ( selectedEntry, true );
			} else {
				Install ( selectedEntry, false );
			}
		}
	}
	
	// Discard button
	function BtnDiscard () {
		if ( !selectedEntry ) { return; }
		
		InventoryManager.RemoveEntry ( selectedEntry );
		UpdateText( null );
		ClearGrid ();
		PopulateGrid ();
	}
	
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		ClearGrid ();
		GameCore.GetInstance().SetPause ( true );
		PopulateGrid ();
		UpdateText ( null );
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