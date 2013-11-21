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
	private var allImages : OGImage[,] = new OGImage[10,3];
	
	
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
		
		allImages = new OGImage[10,3];
		
		for ( var i = 0; i < grid.childCount; i++ ) {
			Destroy ( grid.GetChild ( i ).gameObject );
		}
	}
	
	// Populate grid
	function PopulateGrid () {
		ClearGrid ();
				
		var allSlots : InventoryEntry[,] = InventoryManager.GetSlots();
		
		for ( var x : int = 0; x < allSlots.GetLength(0); x++ ) {
			for ( var y : int = 0; y < allSlots.GetLength(1); y++ ) {
				if ( allSlots[x,y] != null ) {
					var item : Item = allSlots[x,y].GetItem();
					var image : OGImage = new GameObject ( item.name, OGImage ).GetComponent(OGImage);
					image.image = item.image;
					image.transform.parent = grid;
					image.transform.localScale = new Vector3 ( 90, 90, 1 );
					image.transform.localEulerAngles = Vector3.zero;
					image.transform.localPosition = new Vector3 ( x * 90, y * 90, 0 );
					
					allImages[x,y] = image;
				
					if ( allSlots[x,y].equipped || allSlots[x,y].installed ) {
						// Show installed or equipped
					} else {
						// Show normal
					}
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
		
		inspector.entryName.text = item.title;
		inspector.description.text = item.desc;
		inspector.attrName.text = "";
		inspector.attrVal.text = "";
		inspector.action.text = "";
				
		if ( item.type == eItemType.Weapon || item.type == eItemType.Tool ) {
			if ( selectedEntry.equipped ) {
				inspector.action.text = "UNEQUIP";
			} else {
				inspector.action.text = "EQUIP";
				
			}
			
		} else if ( item.type == eItemType.Upgrade ) {
			if ( selectedEntry.installed ) {
				inspector.action.text = "UNINSTALL";
			} else {
				inspector.action.text = "INSTALL";
			}
			
		} else if ( item.type == eItemType.Consumable ) {
			inspector.action.text = "CONSUME";
		
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
			mousePos.x -= 45;
			mousePos.y = Screen.height - mousePos.y - 45;
			mousePos.z = -15;
			
			allImages [ draggingEntry.x, draggingEntry.y ].transform.position = mousePos;
		}
	}
	
	function Exit () {
		OGRoot.GoToPage ( "HUD" );
	}
}