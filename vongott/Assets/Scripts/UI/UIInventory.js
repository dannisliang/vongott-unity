#pragma strict

import System.Text.RegularExpressions;

private class Inspector {
	var entryName : OGLabel;
	var description : OGLabel;
	var attrName : OGLabel;
	var attrVal : OGLabel;
	var action : OGLabel;
}

class UIInventory extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var animations : OGTween[];
	var grid : Transform;
	var inspector : Inspector;
	var btnDiscard : OGButton3D;
	
	var selectedMaterial : Material;
	var equippedMaterial : Material;
	var equippedSelectedMaterial : Material;
	var normalMaterial : Material;
	
	// Private vars
	private var selectedEntry : InventoryEntry;
	private var activeButton : OGButton3D;
	private var buttonsActive : boolean = false;
	
	
	////////////////////
	// Inventory display
	////////////////////
	// Clear grid
	function ClearGrid () {
		selectedEntry = null;
		btnDiscard.gameObject.SetActive ( false );
		
		for ( var i = 0; i < grid.childCount; i++ ) {
			grid.GetChild ( i ).GetChild(0).GetComponent(MeshRenderer).material.mainTexture = null;
			grid.GetChild ( i ).GetChild(0).gameObject.SetActive ( false );
			grid.GetChild(i).GetComponent(MeshRenderer).material = normalMaterial;
		}
	}
	
	// Populate grid
	function PopulateGrid () {
		ClearGrid ();
		
		var allSlots : InventoryEntry[] = InventoryManager.GetSlots();
		
		for ( var i = 0 ; i < allSlots.Length; i++ ) {
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
		if ( entry == null || !buttonsActive ) {
			inspector.entryName.text = "";
			inspector.description.text = "";
			inspector.attrName.text = "";
			inspector.attrVal.text = "";
			inspector.action.text = "";
		
			return;
		}
		
		var item = entry.GetItem();
		
		inspector.entryName.text = item.title;
		inspector.description.text = item.desc;
		inspector.attrName.text = "";
		inspector.attrVal.text = "";
		inspector.action.text = "";
		
		if ( item.type == eItemType.Weapon || item.type == eItemType.Tool ) {
			if ( entry.equipped ) {
				inspector.action.text = "[UNEQUIP]";
			} else {
				inspector.action.text = "[EQUIP]";
			}
			
		} else if ( item.type == eItemType.Upgrade ) {
			if ( entry.installed ) {
				inspector.action.text = "[UNINSTALL]";
			} else {
				inspector.action.text = "[INSTALL]";
			}
			
		} else if ( item.type == eItemType.Consumable ) {
			inspector.action.text = "[CONSUME]";
		
		}
		
		for ( var a : Item.Attribute in item.attr ) {
			inspector.attrName.text += a.type.ToString() + ": \n";
			
			if ( a.type == eItemAttribute.FireRate ) {
				inspector.attrVal.text += Mathf.Pow(a.val,-1).ToString() + " rd / sec\n";
			} else if ( a.type == eItemAttribute.FireRange ) {
				inspector.attrVal.text += a.val.ToString() + " m\n";
			} else if ( a.type == eItemAttribute.Accuracy ) {
				inspector.attrVal.text += a.val.ToString() + " %\n";
			} else {
				inspector.attrVal.text += a.val.ToString() + "\n";
			}
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
		if ( b == activeButton ) { return; }
		
		activeButton = b;
		
		var index : int = int.Parse ( b.gameObject.name );
		var allSlots : InventoryEntry[] = InventoryManager.GetSlots();
		
		PopulateGrid ();
		
		UpdateText ( allSlots[index], b );
			
		selectedEntry = allSlots[index];
		
		btnDiscard.renderer.material = normalMaterial;
		btnDiscard.transform.localEulerAngles = -b.transform.localEulerAngles;
		
		btnDiscard.gameObject.SetActive ( allSlots[index] != null );
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
	
	// Destroy entry
	private function DestroyEntry () {
		if ( !selectedEntry ) { return; }
		
		if ( selectedEntry.GetItem().type == eItemType.Upgrade ) {
			UpgradeManager.Remove ( ( selectedEntry.GetItem() as Upgrade ).upgSlot );
		}
		
		InventoryManager.RemoveEntry ( selectedEntry, true );
		selectedEntry = null;
		activeButton = null;		
		UpdateText( null );
		ClearGrid ();
		PopulateGrid ();
	}
	
	// Consume item
	private function Consume ( item : Item ) {
		GameCore.GetPlayer().Consume ( item );
	}
	
	// Install entry
	private function Install ( entry : InventoryEntry, install : boolean ) {
		entry.installed = install;
		
		var item : Item = entry.GetItem();
		var upgrade : Upgrade = item as Upgrade;
		
		
		if ( install ) {
			UpgradeManager.Install ( upgrade );
							
			// Destroy object if biological upgrade
			if ( item.id == eItemID.BiologicalUpgrade ) {
				DestroyEntry ();
			}
			
		} else {
			UpgradeManager.Remove ( upgrade.upgSlot );
		}
		
		UpdateText ( entry );
	}
	
	// Transition
	function Transition ( forward : boolean, callback : Function ) : IEnumerator {
		var time : float;
		
		for ( var t : OGTween in animations ) {
			t.Play ( forward );
		
			if ( t.move.enabled && t.move.time > time ) { time = t.move.time; }
			if ( t.rotate.enabled && t.rotate.time > time ) { time = t.rotate.time; }
			if ( t.scale.enabled && t.scale.time > time ) { time = t.scale.time; }
		}	
		
		if ( callback ) {
			var targetTime = System.DateTime.Now.AddSeconds ( time );
			
			while ( System.DateTime.Now < targetTime ) {
				yield null;
			}
			
			callback ();
		}
	}
	
	// Equip button
	function BtnEquip () {
		if ( !selectedEntry ) { return; }
		
		var item : Item = selectedEntry.GetItem();
		
		if ( item.type == eItemType.Weapon || item.type == eItemType.Tool ) {
			if ( !selectedEntry.equipped ) {
				Equip ( selectedEntry, true );
			} else {
				Equip ( selectedEntry, false );
			}
	
		} else if ( item.type == eItemType.Upgrade ) {
			if ( !selectedEntry.installed ) {
				Install ( selectedEntry, true );
				
			} else {
				Install ( selectedEntry, false );
			}
		
		} else if ( item.type == eItemType.Consumable ) {
			Consume ( item );
			DestroyEntry ();
			return;
		
		}
		
		if ( activeButton ) {
			if ( selectedEntry.equipped || selectedEntry.installed ) {
				activeButton.GetComponent(MeshRenderer).material = equippedSelectedMaterial;
			
			} else {
				activeButton.GetComponent(MeshRenderer).material = selectedMaterial;
			
			}
		}
	}
	
	// Discard button
	function HoverDiscard ( btn : OGButton3D ) {
		if ( selectedEntry ) {
			inspector.action.text = "[DROP]";
			btn.renderer.material = selectedMaterial;
		}
	}
	
	function OutDiscard ( btn : OGButton3D ) {
		inspector.action.text = "";
		btn.renderer.material = normalMaterial;
	}
	
	function BtnDiscard () {
		if ( !selectedEntry ) { return; }
		
		if ( selectedEntry.GetItem().type == eItemType.Upgrade ) {
			UpgradeManager.Remove ( ( selectedEntry.GetItem() as Upgrade ).upgSlot );
		}
		
		InventoryManager.RemoveEntry ( selectedEntry, false );
		UpdateText( null );
		ClearGrid ();
		PopulateGrid ();
	}
	
	
	////////////////////
	// Init
	////////////////////
	function SetButtons ( state : boolean ) {
		buttonsActive = state;
		
		for ( var c : Component in grid.GetComponentsInChildren(Collider) ) {
			if ( c.GetType() == BoxCollider ) {
				(c as BoxCollider).enabled = state;
			} else if ( c.GetType() == MeshCollider ) {
				(c as MeshCollider).enabled = state;
			}
		}
	}
	
	override function StartPage () {
		SetButtons ( false );
		
		ClearGrid ();
		GameCore.GetInstance().SetPause ( true );
		PopulateGrid ();
		UpdateText ( null );
		
		GameCamera.GetInstance().SetBlur ( true );
		StartCoroutine ( Transition ( true, function () { SetButtons ( true ); } ) );
	}
		
	function Exit () {
		OGRoot.GoToPage ( "HUD" );
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.I) ) {
			GameCamera.GetInstance().SetBlur ( false );
			SetButtons ( false );
			UpdateText ( null );
			btnDiscard.gameObject.SetActive ( false );
			StartCoroutine ( Transition ( false, Exit )	);
		}
	}
}