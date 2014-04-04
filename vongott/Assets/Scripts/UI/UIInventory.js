#pragma strict

import System.Text.RegularExpressions;

private class Inspector {
	var entryName : OGLabel;
	var description : OGLabel;
	var attrName : OGLabel;
	var attrVal : OGLabel;
	var action : OGButton;
	var discard : OGButton;
}

class UIInventory extends OGPage {
	public var grid : Transform;
	public var stash : Transform;
	public var inspector : Inspector;
	public var creditsDisplay : OGLabel;
	public var hoverColorGrid : Color;
	public var normalColorGrid : Color;

	private var selectedEntry : InventoryEntry;
	private var clickStart : float = 0;


	////////////////////
	// Inventory display
	////////////////////
	private function GetClickDuration () : float {
		var result : float = Time.realtimeSinceStartup - clickStart;

		clickStart = -1;
		return result;
	}
	
	// Round
	function Round ( val : float, factor : float ) : float {
		return Mathf.Round ( val / factor ) * factor;
	}
	
	// Clear grid
	function ClearGrid () {
		var gridIcons : OGTexture [] = grid.GetComponentsInChildren.<OGTexture>();

		for ( var i : int = 0; i < gridIcons.Length; i++ ) {
			Destroy ( gridIcons[i].gameObject );
		}
		
		var stashIcons : OGTexture [] = stash.GetComponentsInChildren.<OGTexture>();

		for ( i = 0; i < stashIcons.Length; i++ ) {
			Destroy ( stashIcons[i].gameObject );
		}
		
		var stashButtons : OGButton [] = stash.GetComponentsInChildren.<OGButton>();
		
		for ( i = 0; i < stashButtons.Length; i++ ) {
			Destroy ( stashButtons[i].gameObject );
		}
	}
	
	// Create image
	private function CreateImage ( item : Item, parent : Transform ) : OGTexture {
		var image : OGTexture = new GameObject ( item.name, OGTexture ).GetComponent(OGTexture);
		image.mainTexture = item.image;
		image.isSelectable = true;
		
		if ( parent.parent == grid ) {
			image.isDraggable = true;
			image.resetAfterDrag = true;
		}

		image.transform.parent = parent;
		image.transform.localScale = new Vector3 ( 90, 90, 1 );
		image.transform.localEulerAngles = Vector3.zero;
		image.transform.localPosition = Vector3.zero;

		return image;
	}
	
	// Create remove button
	private function CreateRemoveButton ( slot : int ) : OGButton {
		var button : OGButton = new GameObject ( "RemoveButton", OGButton ).GetComponent(OGButton);
		button.text = "X";
		button.target = this.gameObject;
		button.message = "RemoveStashEntry";
		button.argument = slot.ToString();
		button.GetDefaultStyles();

		button.transform.parent = stash;
		button.transform.localScale = new Vector3 ( 24, 24, 1 );
		button.transform.localPosition = new Vector3 ( 66 + slot * 90, 0, -2 );
		button.transform.localEulerAngles = Vector3.zero;
		
		return button;
	}
	
	// Populate grid
	function PopulateGrid () {
		ClearGrid ();
						
		for ( var x : int = 0; x < InventoryManager.GetInstance().GetSlots().GetLength(0); x++ ) {
			for ( var y : int = 0; y < InventoryManager.GetInstance().GetSlots().GetLength(1); y++ ) {
				if ( InventoryManager.GetInstance().GetEntry(x,y) != null ) {
					var entry : InventoryEntry = InventoryManager.GetInstance().GetEntry(x,y);
					var item : Item = entry.GetItem();
					var image : OGTexture = CreateImage ( item, grid.gameObject.Find ( y + "-" + x ).transform );
					
					if ( entry.GetItem() == InventoryManager.GetInstance().equippedItem ) {
						// Show equipped
					} else if ( entry.installed ) {
						// Show installed
					} else {
						// Show normal
					}
				}
			}
		}
		
		for ( var i : int = 0; i < InventoryManager.GetInstance().GetStash().Length; i++ ) {
			var reference : InventoryEntryReference = InventoryManager.GetInstance().GetStash()[i];
			
			if ( reference != null ) {
				if ( reference.refX != -1 && reference.refY != -1 ) {
					var slotEntry : InventoryEntry = InventoryManager.GetInstance().GetEntry ( reference.refX, reference.refY );
					var slotItem : Item = slotEntry.GetItem();
					var slotImage : OGTexture = CreateImage( slotItem, stash.gameObject.Find ( i.ToString() ).transform );
				
					var button : OGButton = CreateRemoveButton ( i );
				}
			}
		}
	}

	// Update text
	function UpdateText () {
		if ( selectedEntry == null ) {
			inspector.entryName.text = "";
			inspector.description.text = "";
			inspector.attrName.text = "";
			inspector.attrVal.text = "";
			inspector.action.gameObject.SetActive ( false );
			inspector.discard.gameObject.SetActive ( false );
		
			return;
		}
		
		var item = selectedEntry.GetItem();
		
		inspector.entryName.text = item.GetComponent(Prefab).title;
		inspector.description.text = item.GetComponent(Prefab).description;
		inspector.attrName.text = "";
		inspector.attrVal.text = "";
		inspector.action.text = "";
				
		if ( item.type == eItemType.Weapon || item.type == eItemType.Tool ) {
			if ( selectedEntry.GetItem() == InventoryManager.GetInstance().equippedItem ) {
				inspector.action.text = "Unequip";
			} else {
				inspector.action.text = "Equip";
				
			}
			
		} else if ( item.type == eItemType.Upgrade ) {
			if ( selectedEntry.installed ) {
				inspector.action.text = "Uninstall";
			} else {
				inspector.action.text = "Install";
			}
			
		} else if ( item.type == eItemType.Consumable ) {
			inspector.action.text = "Consume";
		
		}
		
		inspector.action.gameObject.SetActive ( true );
		inspector.discard.gameObject.SetActive ( item.canDrop );
		
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
	}
	
	// Go to page
	public function GoToPage ( page : String ) {
		OGRoot.GetInstance().GoToPage ( page );
	}
	
	// Select slot
	function SelectGridSlot ( index : String ) {
		var split : String[] = index.Split ( "-"[0] );
		var y : int = int.Parse ( split[0] );
		var x : int = int.Parse ( split[1] );
		var allSlots : InventoryEntry[,] = InventoryManager.GetInstance().GetSlots();
		
		clickStart = Time.realtimeSinceStartup;
		
		selectedEntry = allSlots[x,y];
		UpdateText ();
	}
	
	// Remove stash entry
	public function RemoveStashEntry ( n : String ) {
		var i : int = int.Parse ( n );
		
		InventoryManager.GetInstance().ClearStashSlot ( i );
		PopulateGrid ();
	}
	
	// Drop on slot
	private function DropOnStashSlot ( index : String ) {
		var i : int = int.Parse ( index ); 
		
		if ( selectedEntry ) {
			InventoryManager.GetInstance().SetStash ( selectedEntry.x, selectedEntry.y, i );
			PopulateGrid ();
		}
	}

	private function DropOnGridSlot ( index : String ) {
		var split : String[] = index.Split ( "-"[0] );
		var y : int = int.Parse ( split[0] );
		var x : int = int.Parse ( split[1] );
		
		if ( selectedEntry ) {
			InventoryManager.GetInstance().MoveEntry ( selectedEntry.x, selectedEntry.y, x, y );
			PopulateGrid ();
		}	
	}
	
	
	////////////////////
	// Action buttons
	////////////////////
	// Equip entry
	private function Equip ( shouldEquip : boolean ) {
		if ( shouldEquip ) {
			var item : Item = selectedEntry.GetItem();
			InventoryManager.GetInstance().Equip ( item );
		} else {
			InventoryManager.GetInstance().UnEquip ();
		}
			
		UpdateText ();
		GameCore.GetPlayer().CheckWeaponPosition();
	}
	
	// Destroy entry
	private function DestroyEntry () {
		if ( !selectedEntry ) { return; }
		
		if ( selectedEntry.GetItem().type == eItemType.Upgrade ) {
			UpgradeManager.Remove ( ( selectedEntry.GetItem() as Upgrade ).upgSlot );
		}
		
		InventoryManager.GetInstance().RemoveEntry ( selectedEntry, true );
		selectedEntry = null;		
		UpdateText();
		ClearGrid ();
		PopulateGrid ();
	}
	
	// Consume item
	private function Consume ( item : Item ) {
		GameCore.GetPlayer().Consume ( item );
	}
	
	// Install entry
	private function Install ( install : boolean ) {
		selectedEntry.installed = install;
		
		var item : Item = selectedEntry.GetItem();
		var upgrade : Upgrade = item as Upgrade;
		
		
		if ( install ) {
			UpgradeManager.Install ( upgrade );
							
			// Destroy object if biological upgrade
			if ( item.subType == eItemSubType.Biological ) {
				DestroyEntry ();
			}
			
		} else {
			UpgradeManager.Remove ( upgrade.upgSlot );
		}
		
		UpdateText ();
	}
	
	// Discard button
	function BtnDiscard () {
		if ( !selectedEntry ) { return; }
		
		DestroyEntry ();
	}
	
	// Action button
	function BtnAction () {
		if ( !selectedEntry ) { return; }
		
		var item : Item = selectedEntry.GetItem();
		
		if ( item.type == eItemType.Weapon || item.type == eItemType.Tool ) {
			if ( selectedEntry.GetItem() != InventoryManager.GetInstance().equippedItem ) {
				Equip ( true );
			} else {
				Equip ( false );
			}
	
		} else if ( item.type == eItemType.Upgrade ) {
			if ( !selectedEntry.installed ) {
				Install ( true );
				
			} else {
				Install ( false );
			}
		
		} else if ( item.type == eItemType.Consumable ) {
			Consume ( item );
			DestroyEntry ();
			return;
		
		}
	}
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		GameCore.state = eGameState.Menu;
	
		creditsDisplay.text = "CREDITS: " + InventoryManager.GetInstance().GetCredits();
		ClearGrid ();
		GameCore.GetInstance().SetPause ( true );
		PopulateGrid ();
		UpdateText ();
		
		InputManager.escFunction = Exit;
	}
	
	override function ExitPage () {
		selectedEntry = null;
		ClearGrid ();
	}
	
	override function UpdatePage () {
		if ( Input.GetMouseButtonDown ( 0 ) ) {
		}
		
		var stashChildren : OGSprite [] = stash.GetComponentsInChildren.<OGSprite>();
		
		for ( var i : int = 0; i < stashChildren.Length; i++ ) {
			if ( stashChildren[i].CheckMouseOver() ) {
				stashChildren[i].tint = hoverColorGrid;
				
				if ( Input.GetMouseButtonUp ( 0 ) ) {
				       	if ( GetClickDuration() > 0.4 ) {
						DropOnStashSlot ( stashChildren[i].transform.parent.gameObject.name );
					}

				}
			} else {
				stashChildren[i].tint = normalColorGrid;
			}
		}
		
		var gridChildren : OGSprite [] = grid.GetComponentsInChildren.<OGSprite>();
		
		for ( i = 0; i < gridChildren.Length; i++ ) {
			if ( gridChildren[i].CheckMouseOver() ) {
				gridChildren[i].tint = hoverColorGrid;
				
				if ( Input.GetMouseButtonUp ( 0 ) ) {
				       	if ( GetClickDuration() > 0.4 ) {
						DropOnGridSlot ( gridChildren[i].transform.parent.gameObject.name );
					}

				} else if ( Input.GetMouseButtonDown ( 0 ) ) {
					SelectGridSlot ( gridChildren[i].transform.parent.gameObject.name );
				
				}

			} else {
				gridChildren[i].tint = normalColorGrid;
			}
		}
	}
	
	function Exit () {
		OGRoot.GetInstance().GoToPage ( "HUD" );
	}
}
