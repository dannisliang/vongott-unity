#pragma strict

import System.Text.RegularExpressions;

private class Inspector {
	public var name : OGLabel;
	public var description : OGLabel;
	public var attrName : OGLabel;
	public var attrVal : OGLabel;
	public var action : OGButton;
	public var discard : OGButton;

	public function Clear () {
		name.text = "";
		description.text = "";
		attrName.text = "";
		attrVal.text = "";
		action.gameObject.SetActive ( false );
		discard.gameObject.SetActive ( false );
	}
}

class UIInventory extends OGPage {
	private class Cell {
		public var button : OGButton;
		public var label : OGLabel;
		public var texture : OGTexture;
		public var gameObject : GameObject;

		function Cell ( t : Transform ) {
			gameObject = t.gameObject;
			button = gameObject.GetComponentInChildren.< OGButton >();
			label = gameObject.GetComponentInChildren.< OGLabel >();
			texture = gameObject.GetComponentInChildren.< OGTexture >();
		}
	}
	
	public var grid : Transform;
	public var stash : Transform;
	public var inspector : Inspector;
	public var creditsDisplay : OGLabel;
	public var hoverColorGrid : Color;
	public var normalColorGrid : Color;
	public var dragTexture : OGTexture;
	
	private var dragging : boolean = false;
	private var selectedSlot : OSSlot;
	private var cells : Cell[,];
	private var inventory : OSInventory;

	// Method for defining the selected OSSlot
	public function SelectSlot ( n : String ) {
		var i : int = int.Parse ( n );

		if ( inventory.slots[i] == selectedSlot ) {
			dragging = true;
			selectedSlot.hidden = true;
		
		} else {
			selectedSlot = inventory.slots[i];

			inspector.name.text = selectedSlot.item.id;
			inspector.description.text = selectedSlot.item.description;
			
			if ( selectedSlot.item.ammunition.enabled ) {
				inspector.attrName.text = selectedSlot.item.ammunition.name + "\n\n";
				inspector.attrVal.text = selectedSlot.item.ammunition.value + "\n\n";
			}

			for ( var attr : OSAttribute in selectedSlot.item.attributes ) {
				inspector.attrName.text += attr.name + "\n";
			       	inspector.attrVal.text += attr.value + "\n";
			}
		}

	}

	// Cancel the currently dragged item
	public function CancelDrag () {
		if ( selectedSlot ) {
			selectedSlot.hidden = false;
		}
		
		dragging = false;
	}

	// Drop selected item
	public function Drop () {
		if ( !dragging && selectedSlot ) {
			if ( inventory.IsEquipped ( selectedSlot.item ) ) {
				inventory.UnequipAll ();
			}
			
			inventory.SpawnSlot ( selectedSlot, GameCore.GetInstance().levelContainer, new Vector3 ( 0, 0.5, 2.3 ) );
			inventory.RemoveSlot ( selectedSlot );

			selectedSlot = null;
			inspector.Clear();
		}
	}

	// Try to move the OSSlot to another location
	public function PutItem ( btn : OGButton ) {
		var p : OSPoint = new OSPoint ( btn.gameObject.name, "-"[0], true );

		if ( selectedSlot ) {
			inventory.grid.Move ( selectedSlot, p.x, p.y );
			CancelDrag ();
		}
	}

	// Consume item
	public function Consume () {
		if ( !dragging && selectedSlot && selectedSlot.item ) {
			inventory.DecreaseSlot ( selectedSlot );
		}
	}

	// Equip/unequip item
	public function Equip () {
		if ( !dragging && selectedSlot && selectedSlot.item ) {
			inventory.UnequipAll ();
			
			inventory.SetEquipped ( selectedSlot.item );
		}
	}

	public function Unequip () {
		inventory.UnequipAll ();
	}

	// Update cell content
	private function UpdateCells () {
		var slotSize : float = 90;
		
		// Keep the drag texture underneath the mouse...
		dragTexture.transform.position = new Vector3 ( Input.mousePosition.x - slotSize / 2, Screen.height - Input.mousePosition.y - slotSize / 2, 0 );

		// ...and make sure it has the right texture
		if ( dragging && selectedSlot && selectedSlot.item ) {
			dragTexture.mainTexture = selectedSlot.item.preview;
			dragTexture.transform.localScale = new Vector3 ( selectedSlot.scale.x * slotSize, selectedSlot.scale.y * slotSize, 1 );	
		
		} else {
			dragTexture.mainTexture = null;
		
		}

		// Set button properties
		if ( selectedSlot && selectedSlot.item ) {
			if ( selectedSlot.item.category == "Consumable" ) {
				inspector.action.gameObject.SetActive ( true );
				inspector.action.text = "Consume";
				inspector.action.target = this.gameObject;
				inspector.action.message = "Consume";
			
			} else if ( selectedSlot.item.category == "Equipment" ) {
				inspector.action.gameObject.SetActive ( true );
				inspector.action.target = this.gameObject;
				
				if ( inventory.IsEquipped ( selectedSlot.item ) ) {
					inspector.action.text = "Unequip";
					inspector.action.message = "Unequip";
				} else {
					inspector.action.text = "Equip";
					inspector.action.message = "Equip";
				}
			
			} else {
				inspector.action.gameObject.SetActive ( false );

			}

			inspector.discard.gameObject.SetActive ( selectedSlot.item.canDrop );
		} else {
			inspector.action.gameObject.SetActive ( false );
			inspector.discard.gameObject.SetActive ( false );
		
		}
			
		// Get the list of skipped cells, so we know which ones to draw
		var skip : boolean  [ , ] = inventory.grid.GetSkippedSlots ();

		// Loop through both axies of the OSGrid
		for ( var x : int = 0; x < inventory.grid.width; x++ ) {
			for ( var y : int = 0; y < inventory.grid.height; y++ ) {
				var cell : Cell = cells[x,y];
				
				if ( cell ) {
					// Force its position
					cell.gameObject.transform.localPosition = new Vector3 ( x * slotSize, y * slotSize, 0 );
					
					// Get the correspending OSSlot from the OSInventory
					var slot : OSSlot = inventory.GetSlot ( x, y );

					// If there is a slot, and it's not currently hidden, draw the content
					if ( slot && !slot.hidden ) {
						// Set the texture and scale of the cell, bind correct functions	
						cell.texture.transform.localScale = new Vector3 ( slotSize * slot.scale.x, slotSize * slot.scale.y, 1 );
						cell.button.transform.localScale = cell.texture.transform.localScale;
						cell.label.transform.localScale = cell.texture.transform.localScale;
						
						if ( slot.item ) {
							cell.texture.mainTexture = slot.item.preview;
							
							cell.button.target = this.gameObject;
							cell.button.message = "SelectSlot";
							cell.button.argument = inventory.GetItemIndex ( slot.item ).ToString();
							
							cell.label.text = slot.quantity > 1 ? slot.quantity.ToString() : "";

						} else {
							cell.texture.mainTexture = null;
							
							cell.button.target = this.gameObject;
							cell.label.text = "";
							cell.button.message = "PutItem";
							cell.button.argument = null;
						}

					// If not, draw an empty cell and cancel any functions bound to it
					} else {
						cell.texture.transform.localScale = new Vector3 ( slotSize, slotSize, 1 );
						cell.texture.mainTexture = null;
						cell.button.target = this.gameObject;
						cell.label.text = "";
						cell.button.message = "PutItem";
						cell.button.argument = null;
					}
				
					// If this cell is skipped, hide it	
					cell.gameObject.SetActive ( !skip [ x, y ] );
				}
			}
		}
	}

	private function InitCells () {
		cells = new Cell [ inventory.grid.width, inventory.grid.height ];

		var counter : int = 0;

		for ( var x : int = 0; x < inventory.grid.width; x++ ) {
			for ( var y : int = 0; y < inventory.grid.height; y++ ) {
				var newCell : Cell = new Cell ( grid.GetChild(counter) );
			
				newCell.gameObject.name = y + "-" + x;	
				newCell.gameObject.transform.localPosition = new Vector3 ( x * newCell.button.transform.localScale.x, y * newCell.button.transform.localScale.y );
				
				cells[x,y] = newCell;

				counter++;
			}
		}
	}

	public function StartPage () {
		inventory = GameCore.GetInstance().GetComponent.<OSInventory>();
		
		InitCells ();
	
		UpdateCells ();
	}

	public function Exit () {
		OGRoot.GetInstance().GoToPage ( "HUD" );
	}
}
