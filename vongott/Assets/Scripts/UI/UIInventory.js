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

private class Point {
	var x : int;
	var y : int;
	
	function Point ( a : int, b : int ) {
		x = a;
		y = b;
	}
}

class UIInventory extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var animations : OGTween[];
	var grid : Transform;
	var stash : Transform;
	var inspector : Inspector;
	var creditsDisplay : OGLabel;
	
	// Private vars
	private var selectedEntry : InventoryEntry;
	private var draggingEntry : Point;
	private var listenForDrag : Point;
	private var mouseClickTimer : float = 0.0;
	private var allImages : OGTexture[,] = new OGTexture[10,3];
	
	
	////////////////////
	// Inventory display
	////////////////////
	// Round
	function Round ( val : float, factor : float ) : float {
		return Mathf.Round ( val / factor ) * factor;
	}
	
	// Clear grid
	function ClearGrid () {
		selectedEntry = null;
		
		allImages = new OGTexture[10,3];
		
		for ( var i = 0; i < grid.childCount; i++ ) {
			Destroy ( grid.GetChild ( i ).gameObject );
		}
		
		for ( i = 0; i < stash.childCount; i++ ) {
			Destroy ( stash.GetChild ( i ).gameObject );
		}
	}
	
	// Create image
	private function CreateImage ( item : Item, parent : Transform ) : OGTexture {
		var image : OGTexture = new GameObject ( item.name, OGTexture ).GetComponent(OGTexture);
		image.image = item.image;
		image.transform.parent = parent;
		image.transform.localScale = new Vector3 ( Round ( item.image.width, 90 ), Round ( item.image.height, 90 ), 1 );
		image.transform.localEulerAngles = Vector3.zero;
		
		return image;
	}
	
	// Create remove button
	private function CreateRemoveButton ( slot : int ) : OGButton {
		var button : OGButton = new GameObject ( "RemoveButton", OGButton ).GetComponent(OGButton);
		button.text = "X";
		button.target = this.gameObject;
		button.message = "RemoveStashEntry";
		button.argument = slot.ToString();
		
		button.transform.parent = stash;
		button.transform.localScale = new Vector3 ( 24, 24, 1 );
		button.transform.localPosition = new Vector3 ( 66 + slot * 90, 0, -20 );
		button.transform.localEulerAngles = Vector3.zero;
		
		return button;
	}
	
	// Populate grid
	function PopulateGrid () {
		ClearGrid ();
						
		for ( var x : int = 0; x < InventoryManager.GetSlots().GetLength(0); x++ ) {
			for ( var y : int = 0; y < InventoryManager.GetSlots().GetLength(1); y++ ) {
				if ( InventoryManager.GetEntry(x,y) != null ) {
					var entry : InventoryEntry = InventoryManager.GetEntry(x,y);
					var item : Item = entry.GetItem();
					var image : OGTexture = CreateImage ( item, grid );
					image.transform.localPosition = new Vector3 ( x * 90, y * 90, 0 );
					allImages[x,y] = image;
								
					if ( entry.equipped ) {
						// Show equipped
					} else if ( entry.installed ) {
						// Show installed
					} else {
						// Show normal
					}
				}
			}
		}
		
		for ( var i : int = 0; i < InventoryManager.GetStash().Length; i++ ) {
			var reference : InventoryEntryReference = InventoryManager.GetStash()[i];
			
			if ( reference != null ) {
				var slotEntry : InventoryEntry = InventoryManager.GetEntry ( reference.refX, reference.refY );
				var slotItem : Item = entry.GetItem();
				
				var slotImage : OGTexture = CreateImage( item, stash );
				slotImage.transform.localPosition = new Vector3 ( i * 90, 0, 0 );
			
				var button : OGButton = CreateRemoveButton ( i );
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
		
		inspector.entryName.text = item.title;
		inspector.description.text = item.desc;
		inspector.attrName.text = "";
		inspector.attrVal.text = "";
		inspector.action.text = "";
				
		if ( item.type == eItemType.Weapon || item.type == eItemType.Tool ) {
			if ( selectedEntry.equipped ) {
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
	function SelectSlot () {
		var allSlots : InventoryEntry[,] = InventoryManager.GetSlots();
		
		var mousePos : Vector3 = Input.mousePosition;
		mousePos.y = Screen.height - mousePos.y;
		mousePos = mousePos - grid.transform.position;
		
		var x : int = Mathf.Floor ( mousePos.x / 90 );
		var y : int = Mathf.Floor ( mousePos.y / 90 );
			
		if ( mousePos.x > 0 && mousePos.y > 0 && x < allSlots.GetLength(0) && y < allSlots.GetLength(1) ) {
			if ( allSlots[x,y] != null ) {
				selectedEntry = allSlots[x,y];
				
				UpdateText ();
			
				listenForDrag = new Point ( x, y );
			
			} else {
				selectedEntry = null;
		
			}
		}
	}
	
	// Remove stash entry
	public function RemoveStashEntry ( n : String ) {
		var i : int = int.Parse ( n );
		
		InventoryManager.ClearStashSlot ( i );
		PopulateGrid ();
	}
	
	// Drop on slot
	function DropOnSlot () {
		var allSlots : InventoryEntry[,] = InventoryManager.GetSlots();
		
		var mousePos : Vector3 = Input.mousePosition;
		mousePos.y = Screen.height - mousePos.y;
		
		var mousePosGrid = mousePos - grid.transform.position;
		var mousePosStash = mousePos - stash.transform.position;
		
		var gridX : int = Mathf.Floor ( mousePosGrid.x / 90 );
		var gridY : int = Mathf.Floor ( mousePosGrid.y / 90 );
		var stashX : int = Mathf.Floor ( mousePosStash.x / 90 );
		
		// Dropped somewhere on grid
		if ( mousePosGrid.x > 0 && mousePosGrid.y > 0 && gridX < allSlots.GetLength(0) && gridY < allSlots.GetLength(1) ) {
			InventoryManager.MoveEntry ( draggingEntry.x, draggingEntry.y, gridX, gridY );
			draggingEntry = null;
			PopulateGrid ();			
		
		// Dropped somewhere in stash
		} else if ( mousePosStash.x > 0 && mousePosStash.y > 0 && mousePosStash.y < 90 && stashX < 10 ) {
			InventoryManager.SetStash ( draggingEntry.x, draggingEntry.y, stashX );
			draggingEntry = null;
			PopulateGrid ();
		
		// Dropped somewhere else
		} else {
			draggingEntry = null;
			PopulateGrid ();
		
		}
	}
	
	
	////////////////////
	// Action buttons
	////////////////////
	// Equip entry
	private function Equip ( equip : boolean ) {
		selectedEntry.equipped = equip;
		
		var item : Item = selectedEntry.GetItem();
		
		InventoryManager.Equip ( item, equip );
		
		UpdateText ();
	}
	
	// Destroy entry
	private function DestroyEntry () {
		if ( !selectedEntry ) { return; }
		
		if ( selectedEntry.GetItem().type == eItemType.Upgrade ) {
			UpgradeManager.Remove ( ( selectedEntry.GetItem() as Upgrade ).upgSlot );
		}
		
		InventoryManager.RemoveEntry ( selectedEntry, true );
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
			if ( item.id == eItemID.BiologicalUpgrade ) {
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
			if ( !selectedEntry.equipped ) {
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
		
		creditsDisplay.text = "CREDITS: " + InventoryManager.GetCredits();
		ClearGrid ();
		GameCore.GetInstance().SetPause ( true );
		PopulateGrid ();
		UpdateText ();
		
		InputManager.escFunction = Exit;
	}
	
	override function ExitPage () {
		draggingEntry = null;
		mouseClickTimer = 0.0;
		listenForDrag = null;
		selectedEntry = null;
		ClearGrid ();
	}
	
	override function UpdatePage () {
		if ( Input.GetMouseButtonDown ( 0 ) ) {
			SelectSlot ();
		
		} else if ( Input.GetMouseButtonUp ( 0 ) && draggingEntry ) {
			DropOnSlot ();
		
		}
		
		if ( Input.GetMouseButton ( 0 ) ) {
			mouseClickTimer += GameCore.GetInstance().ignoreTimeScale;
			
			if ( listenForDrag && mouseClickTimer > 0.25 ) {
				draggingEntry = listenForDrag;
			}
			
		} else {
			mouseClickTimer = 0.0;
			listenForDrag = null;
		
		}
		
		if ( draggingEntry != null ) {
			var mousePos : Vector3 = Input.mousePosition;
			mousePos.y = Screen.height - mousePos.y;
			mousePos.z = 0;
			
			allImages [ draggingEntry.x, draggingEntry.y ].transform.position = mousePos;
		}
	}
	
	function Exit () {
		OGRoot.GetInstance().GoToPage ( "HUD" );
	}
}
