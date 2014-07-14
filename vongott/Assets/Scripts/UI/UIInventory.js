#pragma strict

import System.Text.RegularExpressions;

private class Inspector {
	public var name : OGLabel;
	public var description : OGLabel;
	public var attrName : OGLabel;
	public var attrVal : OGLabel;
	public var attrTitle : OGLabel;
	public var ammoName : OGLabel;
	public var ammoVal : OGLabel;
	public var ammoTex : OGTexture;
	public var ammoTitle : OGLabel;
	public var action : OGButton;
	public var discard : OGButton;

	public function Clear () {
		name.text = "";
		description.text = "";
		attrName.text = "";
		attrVal.text = "";
		ammoName.text = "";
		ammoVal.text = "";
		action.gameObject.SetActive ( false );
		discard.gameObject.SetActive ( false );
		ammoTitle.gameObject.SetActive ( false );
		attrTitle.gameObject.SetActive ( false );
	}

	public function Display ( item : OSItem ) {
		if ( item == null ) {
			Clear ();

		} else {
			attrTitle.gameObject.SetActive ( true );

			name.text = item.id;
			description.text = item.description;
			
			if ( item.ammunition.enabled ) {
				ammoTitle.gameObject.SetActive ( true );
				ammoName.text = item.ammunition.name;
				ammoVal.text = item.ammunition.value.ToString();
			
			} else {
				ammoTitle.gameObject.SetActive ( false );
			
			}

			for ( var attr : OSAttribute in item.attributes ) {
				attrName.text += attr.name + "\n";
			       	attrVal.text += attr.value + "\n";
			}

		}
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

	private class QuickSlot {
		public var btnRemove : OGButton;
		public var btnPut : OGButton;
		public var gameObject : GameObject;
		public var texture : OGTexture;

		function QuickSlot ( t : Transform ) {
			gameObject = t.gameObject;
			
			for ( var b : OGButton in gameObject.GetComponentsInChildren.< OGButton > () ) {
				if ( b.gameObject.name == "btn_Remove" ) {
					btnRemove = b;
				} else {
					btnPut = b;
				}
			}
			
			texture = gameObject.GetComponentInChildren.< OGTexture >();
		}
	}
	
	public var grid : Transform;
	public var quick : Transform;
	public var inspector : Inspector;
	public var creditsDisplay : OGLabel;
	public var hoverColorGrid : Color;
	public var normalColorGrid : Color;
	public var dragTexture : OGTexture;
	
	private var dragging : boolean = false;
	private var selectedSlot : OSSlot;
	private var cells : Cell[,];
	private var quickSlots : QuickSlot[];
	private var inventory : OSInventory;
	private var slotSize : float = 90;
		

	// Method for defining the selected OSSlot
	public function SelectSlot ( n : String ) {
		inspector.Clear ();
		
		if ( dragging ) { return; }
		
		var i : int = int.Parse ( n );

		if ( inventory.slots[i] == selectedSlot ) {
			dragging = true;
			selectedSlot.hidden = true;
		
		} else {
			selectedSlot = inventory.slots[i];

			inspector.Display ( selectedSlot.item );
		}

		UpdateCells ();
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
		var strings : String[] = btn.transform.parent.gameObject.name.Split ( "-"[0] );
		var x : int = int.Parse ( strings[0] );
		var y : int = int.Parse ( strings[1] );
		
		if ( selectedSlot ) {
			inventory.grid.Move ( selectedSlot, x, y );
			CancelDrag ();
		}

		UpdateCells ();
	}

	public function PutInQuickSlot ( n : String ) {
		if ( !dragging ) { return; }
		
		var i : int = int.Parse ( n );
		
		if ( selectedSlot ) {
			inventory.SetQuickItem ( selectedSlot.item, i );
			CancelDrag ();
		}

		UpdateCells ();
	}

	public function RemoveFromQuickSlot ( n : String ) {
		var i : int = int.Parse ( n );

		inventory.ClearQuickItem ( i );
		
		UpdateCells ();
	}

	// Consume item
	public function Consume () {
		if ( !dragging && selectedSlot && selectedSlot.item ) {
			inventory.DecreaseSlot ( selectedSlot );
		}
		
		if ( selectedSlot.quantity < 1 ) {
			selectedSlot = null;
		}
		
		UpdateCells ();
	}

	// Install items
	public function Install () {
		if ( !dragging && selectedSlot && selectedSlot.item ) {
			inventory.DecreaseSlot ( selectedSlot );
		}
	
		selectedSlot = null;

		UpdateCells ();
	}

	// Equip/unequip item
	public function Equip () {
		if ( !dragging && selectedSlot && selectedSlot.item ) {
			inventory.UnequipAll ();
			
			inventory.SetEquipped ( selectedSlot.item );
		}
		
		UpdateCells ();
	}

	public function Unequip () {
		inventory.UnequipAll ();
		
		UpdateCells ();
	}

	// Update cell content
	private function UpdateCells () {
		// Set button properties
		if ( selectedSlot && selectedSlot.item ) {
			switch ( selectedSlot.item.category ) {
				case "Consumable":
					inspector.action.gameObject.SetActive ( true );
					inspector.action.text = "Consume";
					inspector.action.target = this.gameObject;
					inspector.action.message = "Consume";
					break;

				case "Upgrade":
					inspector.action.gameObject.SetActive ( true );
					inspector.action.text = "Install";
					inspector.action.target = this.gameObject;
					inspector.action.message = "Install";
					break;

				case "Weapon": case "Tool":
					inspector.action.gameObject.SetActive ( true );
					inspector.action.target = this.gameObject;
					if ( selectedSlot.equipped ) {
						inspector.action.text = "Unequip";
						inspector.action.message = "Unequip";
					} else {
						inspector.action.text = "Equip";
						inspector.action.message = "Equip";
					}
					break;

				default:
					inspector.action.gameObject.SetActive ( false );
					break;
			}

			inspector.discard.gameObject.SetActive ( selectedSlot.item.canDrop );
		} else {
			inspector.Clear ();

		}
			
		// Get the list of skipped cells, so we know which ones to draw
		var skip : boolean  [ , ] = inventory.grid.GetSkippedSlots ();

		// Loop through both axies of the OSGrid
		for ( var x : int = 0; x < inventory.grid.width; x++ ) {
			for ( var y : int = 0; y < inventory.grid.height; y++ ) {
				var cell : Cell = cells[x,y];
				
				if ( cell ) {
					cell.gameObject.name = x + "-" + y;
					
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
						cell.button.transform.localScale = cell.texture.transform.localScale;
						cell.label.transform.localScale = cell.texture.transform.localScale;
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

		// Loop through the quick slots
		for ( var i : int = 0; i < 10; i++ ) {
			var goSlot : QuickSlot = quickSlots[i];
			var item : OSItem = inventory.GetQuickItem ( i );

			if ( item ) {
				goSlot.texture.mainTexture = item.thumbnail;
				goSlot.btnRemove.gameObject.SetActive ( true );

			} else {
				goSlot.texture.mainTexture = null;
				goSlot.btnRemove.gameObject.SetActive ( false );

			}
		}	
	}

	private function InitCells () {
		if ( !cells ) {
			cells = new Cell [ inventory.grid.width, inventory.grid.height ];

			var counter : int = 0;

			for ( var x : int = 0; x < inventory.grid.width; x++ ) {
				for ( var y : int = 0; y < inventory.grid.height; y++ ) {
					var newCell : Cell = new Cell ( grid.GetChild(counter) );
				
					newCell.gameObject.name = y + "-" + x;	
					
					cells[x,y] = newCell;

					counter++;
				}
			}
		}	

		if ( !quickSlots ) {
			quickSlots = new QuickSlot [ 10 ];

			for ( var i : int = 0; i < 10; i++ ) {
				var newSlot : QuickSlot = new QuickSlot ( quick.GetChild(i) );

				newSlot.btnPut.target = this.gameObject;
				newSlot.btnPut.message = "PutInQuickSlot";
				newSlot.btnPut.argument = i.ToString ();
				
				newSlot.btnRemove.target = this.gameObject;
				newSlot.btnRemove.message = "RemoveFromQuickSlot";
				newSlot.btnRemove.argument = i.ToString ();

				newSlot.gameObject.name = i.ToString();
				newSlot.gameObject.transform.localPosition = new Vector3 ( i * 90, 0, 0 );

				quickSlots[i] = newSlot;
			}
		}
	}

	override function StartPage () {
		inventory = GameCore.GetInventory();
	
		inspector.Clear ();
		
		GameCore.GetInstance().SetPause ( true );

		InitCells ();
		UpdateCells ();
	}

	override function UpdatePage () {
		// Keep the drag texture underneath the mouse...
		dragTexture.transform.position = new Vector3 ( Input.mousePosition.x - slotSize / 2, Screen.height - Input.mousePosition.y - slotSize / 2, 0 );

		// ...and make sure it has the right texture
		if ( dragging && selectedSlot && selectedSlot.item ) {
			dragTexture.mainTexture = selectedSlot.item.preview;
			dragTexture.transform.localScale = new Vector3 ( selectedSlot.scale.x * slotSize, selectedSlot.scale.y * slotSize, 1 );	
		
		} else {
			dragTexture.mainTexture = null;
		
		}
	}

	override function ExitPage () {
		selectedSlot = null;
	}
}
