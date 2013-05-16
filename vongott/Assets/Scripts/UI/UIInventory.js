#pragma strict

import System.Text.RegularExpressions;

private class InventorySlot {
	var button : GameObject;
	var image : GameObject;
	
	function InventorySlot ( i : int, col : int, row : int, parent : Transform, target : GameObject ) {
		button = new GameObject ( "slot_" + i.ToString() + "_button" );
		image = new GameObject ( "slot_" + i.ToString() + "_image" );
		
		var btn = button.AddComponent ( OGButton );
		var img = image.AddComponent ( OGImage );
		
		btn.target = target;
		btn.message = "SelectSlot";
		btn.argument = i.ToString();
		btn.style = "Button";
	
		var x : float = col * 102;
		var y : float = ( -row * 102 ) - 102;
	
		button.transform.parent = parent;	
		button.transform.localScale = new Vector3 ( 100, 100, 1 );
		button.transform.localPosition = new Vector3 ( x, y, 2 );
		
		image.transform.parent = parent;	
		image.transform.localScale = new Vector3 ( 80, 80, 1 );
		image.transform.localPosition = new Vector3 ( x + 10, y + 10, 0 );
	}
}

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
	var slots : List.< InventorySlot > = new List. < InventorySlot >();
	var inspector : Inspector;
	var buttons : InspectorButtons;
	
	// Private vars
	@HideInInspector private var selectedEntry : Entry;
	
	
	////////////////////
	// Inventory display
	////////////////////
	// Clear grid
	function ClearGrid () {
		for ( var i = 0; i < grid.childCount; i++ ) {
			Destroy ( grid.GetChild ( i ).gameObject );
		}
		
		slots.Clear();
	}
	
	// Populate grid
	function PopulateGrid () {
		ClearGrid ();
		
		var allSlots : Slot[] = InventoryManager.GetSlots();
		
		var col = 0;
		var row = 0;
		
		for ( var i = 0 ; i < allSlots.Length; i++ ) {
			var slot : InventorySlot = new InventorySlot ( i, col, row, grid, this.gameObject );
			
			if ( allSlots[i].entry ) {
				slot.image.GetComponent(OGImage).image = allSlots[i].entry.image;
			}
			
			slots.Add ( slot );
		
			if ( col < 3 ) {
				col++;
			} else {
				col = 0;
				row++;
			}
		}
	}
	
	// Select slot
	function SelectSlot ( i : String ) {
		var index : int = int.Parse ( i );
		var allSlots : Slot[] = InventoryManager.GetSlots();
		
		if ( allSlots[index].entry ) {
			var entry = allSlots[index].entry;
		
			inspector.entryName.text = entry.title;
			inspector.description.text = entry.desc;
			inspector.attrName.text = "";
			inspector.attrVal.text = "";
			
			for ( var a : Item.Attribute in entry.attr ) {
				inspector.attrName.text += a.type.ToString() + ": \n";
				inspector.attrVal.text += a.val.ToString() + "\n";
			}
			
			if ( entry.type == Item.Types.Equipment ) {
				if ( !entry.equipped ) {
					SetButtons ( "Discard", "Equip" );
				} else {
					SetButtons ( null, "Unequip" );
				}
			} else if ( entry.type == Item.Types.Upgrade ) {
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
	private function Equip ( entry : Entry, equip : boolean ) {
		entry.equipped = equip;
	}
	
	// Install entry
	private function Install ( entry : Entry, install : boolean ) {
		entry.installed = install;
	}
	
	// Set buttons
	function SetButtons ( btn1 : String, btn2 : String ) {
		if ( btn1 != null ) {
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
		}
	}
	
	// Equip button
	function BtnEquip () {
		if ( selectedEntry.type == Item.Types.Equipment ) {
			if ( !selectedEntry.equipped ) {
				Equip ( selectedEntry, true );
				InventoryManager.EquipEntry ( selectedEntry, true );
				SetButtons ( null, "Unequip" );
			} else {
				Equip ( selectedEntry, false );
				InventoryManager.EquipEntry ( selectedEntry, false );
				SetButtons ( "Discard", "Equip" );
			}
	
		} else if ( selectedEntry.type == Item.Types.Upgrade ) {
			if ( !selectedEntry.installed ) {
				Install ( selectedEntry, true );
				UpgradeManager.InstallEntry ( selectedEntry, true );
				SetButtons ( null, "Uninstall" );
			} else {
				Install ( selectedEntry, false );
				UpgradeManager.InstallEntry ( selectedEntry, false );
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
		GameCore.ToggleControls ( false );
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