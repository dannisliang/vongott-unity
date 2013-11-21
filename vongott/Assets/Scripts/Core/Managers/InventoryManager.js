#pragma strict

class InventoryManager {
	////////////////////
	// Prerequisites
	////////////////////
	// Static vars
	static var slots : InventoryEntry[,] = new InventoryEntry[10,3];
	static var stash : InventoryEntryReference[] = new InventoryEntryReference[10];
	static var credits : int = 0;


	////////////////////
	// Static functions
	////////////////////
	// Get slots
	static function GetSlots () : InventoryEntry[,] { return slots; }
	
	// Get slots
	static function GetStash () : InventoryEntryReference[] { return stash; }

	// Get entry
	static function GetEntry ( x : int, y : int ) : InventoryEntry {
		if ( slots[x,y] != null ) {
			if ( slots[x,y].GetType() == InventoryEntryReference ) {
				return slots [ ( slots[x,y] as InventoryEntryReference ).refX, ( slots[x,y] as InventoryEntryReference ).refY ];
			
			} else {
				return slots[x,y];
				
			}
				
		} else {
			return null;
		
		}
	}

	// Get credits
	static function GetCredits() : int { return credits; }

	// Add item to stash
	static function SetStash ( refX : int, refY : int, slot : int ) {
		stash[slot] = new InventoryEntryReference ( refX, refY );
	}

	// Add item
	static function AddItem ( item : Item ) {
		for ( var x : int = 0; x < slots.GetLength(0); x++ ) {
			for ( var y : int = 0; y < slots.GetLength(1); y++ ) {
				if ( slots[x,y] == null ) {
					slots[x,y] = new InventoryEntry ( item );
					FlagManager.SetItemFlag ( item, true );
					
					GameCore.Print ( "InventoryManager | Added item " + item.title + " to inventory" );
					
					return;
				}
			}
		}
	}

	// Move entry
	static function MoveEntry ( fromX : int, fromY : int, toX : int, toY : int ) {
		var entry : InventoryEntry = slots[fromX, fromY];

		slots[fromX,fromY] = null;
		slots[toX,toY] = entry;
		
		GameCore.Print ( "InventoryManager | Moved item '" + entry.GetItem().title + "' from (" + fromX + "," + fromY + ") to (" + toX + "," + toY + ")" );
	}

	// Change credits amount
	static function ChangeCredits ( amount : int ) {
		credits += amount;
	}

	// Eqip entry
	static function Equip ( i : Item, equip : boolean ) {
		var player : Player = GameCore.GetPlayerObject().GetComponent(Player);
		player.Equip ( MonoBehaviour.Instantiate (i) as Item, equip );
	}

	// Remove entry
	static function RemoveEntry ( x : int, y : int, delete : boolean ) {
		if ( !delete ) {
			var droppedItem : Item = MonoBehaviour.Instantiate ( slots[x,y].GetItem() );
			droppedItem.transform.parent = GameCore.GetPlayerObject().transform.parent;
			droppedItem.transform.position = GameCore.GetPlayerObject().GetComponent(Player).torso.transform.position + ( GameCore.GetPlayerObject().transform.forward * 0.5 );
			droppedItem.transform.localEulerAngles = Vector3.zero;
			droppedItem.transform.localScale = Vector3.one;
		}
			
		if ( slots[x,y].equipped ) {
			GameCore.GetPlayerObject().GetComponent(Player).Equip ( null, false );
		}
					
		GameCore.Print ( "InventoryManager | Removed entry: " + slots[x,y] );
		slots[x,y] = null;
	}

	static function RemoveEntry ( e : InventoryEntry, delete : boolean ) {
		for ( var x : int = 0; x < slots.GetLength(0); x++ ) {
			for ( var y : int = 0; y < slots.GetLength(1); y++ ) {
				if ( slots[x,y] == e ) {
					RemoveEntry ( x, y, delete );
					FlagManager.SetItemFlag ( e.GetItem(), false );
					
					return;
				}
			}
		}
	}

	// Init inventory
	static function Init () {

	}

	// Clear
	static function Clear () {
		for ( var x : int = 0; x < slots.GetLength(0); x++ ) {
			for ( var y : int = 0; y < slots.GetLength(1); y++ ) {
				slots[x,y] = null;
			}
		}
	}
}