#pragma strict

class InventoryManager extends MonoBehaviour {
	private var slots : InventoryEntry[,];
	private var stash : InventoryEntryReference[];
	public var credits : int = 0;

	public static var instance : InventoryManager;


	////////////////////
	// Static functions
	////////////////////
	static function GetInstance () : InventoryManager {
		return instance;
	}

	// Get slots
	public function GetSlots () : InventoryEntry[,] { return slots; }
	
	// Get slots
	public function GetStash () : InventoryEntryReference[] { return stash; }

	// Get entry
	public function GetEntry ( x : int, y : int ) : InventoryEntry {
		if ( slots[x,y] != null ) {
			var slot : InventoryEntry = slots[x,y];
		
			if ( slots.GetType() == InventoryEntryReference ) {
				var ref : InventoryEntryReference = slot as InventoryEntryReference;
				return slots [ ref.refX, ref.refY ];
			
			} else {
				return slot;
				
			}
				
		} else {
			return null;
		
		}
	}

	// Get credits
	public function GetCredits() : int { return credits; }

	// Clear stash slot
	public function ClearStashSlot ( i : int ) {
		stash[i] = null;
	}

	// Clear stash
	public function ClearStash () {
		stash = new InventoryEntryReference[10];
	}

	// Add item to stash
	public function SetStash ( refX : int, refY : int, slot : int ) {
		for ( var i : int = 0; i < stash.Length; i++ ) {
			if ( stash[i] != null && stash[i].refX == refX && stash[i].refY == refY ) {
				stash[i] = null;
			}
		}
	
		stash[slot] = new InventoryEntryReference ( refX, refY );
	
		GameCore.Print ( "InventoryManager | Item '" + GetEntry ( refX, refY ).GetItem().title + "' put in stash slot " + slot );
	}

	// Add item
	public function AddItem ( item : Item ) {
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

	// Update stash reference
	public function UpdateStashReference ( fromX : int, fromY : int, toX : int, toY : int ) {
		for ( var i : int = 0; i < stash.Length; i++ ) {
			if ( stash[i] != null && stash[i].refX == fromX && stash[i].refY == fromY ) {
				stash[i].refX = toX;
				stash[i].refY = toY;
			}
		}
	}

	// Move entry
	public function MoveEntry ( fromX : int, fromY : int, toX : int, toY : int ) {
		var entry : InventoryEntry = slots[fromX, fromY];
	
		UpdateStashReference ( fromX, fromY, toX, toY );

		slots[fromX,fromY] = null;
		slots[toX,toY] = entry;
		
		GameCore.Print ( "InventoryManager | Moved item '" + entry.GetItem().title + "' from (" + fromX + "," + fromY + ") to (" + toX + "," + toY + ")" );
	}

	// Change credits amount
	public function ChangeCredits ( amount : int ) {
		credits += amount;
	}

	// Eqip entry
	public function Equip ( i : Item, equip : boolean ) {
		var player : Player = GameCore.GetPlayerObject().GetComponent(Player);
		player.Equip ( MonoBehaviour.Instantiate (i) as Item, equip );
	}

	// Remove entry
	public function RemoveEntry ( x : int, y : int, delete : boolean ) {
		if ( !delete ) {
			var droppedItem : Item = MonoBehaviour.Instantiate ( slots[x,y].GetItem() );
			droppedItem.transform.parent = GameCore.GetPlayerObject().transform.parent;
			droppedItem.transform.position = GameCore.GetPlayerObject().GetComponent(Player).hand.transform.position + ( GameCore.GetPlayerObject().transform.forward * 0.5 );
			droppedItem.transform.localEulerAngles = Vector3.zero;
			droppedItem.transform.localScale = Vector3.one;
		}
			
		if ( slots[x,y].equipped ) {
			GameCore.GetPlayerObject().GetComponent(Player).Equip ( null, false );
		}
					
		GameCore.Print ( "InventoryManager | Removed entry: " + slots[x,y] );
		slots[x,y] = null;
	}

	public function RemoveEntry ( e : InventoryEntry, delete : boolean ) {
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
	function Start () {
		instance = this;
		
	       	slots = new InventoryEntry[10,3];
		stash = new InventoryEntryReference[10];
		
		GameCore.Print ( "InventoryManager | Started" );
	}

	// Clear
	public function Clear () {
		for ( var x : int = 0; x < slots.GetLength(0); x++ ) {
			for ( var y : int = 0; y < slots.GetLength(1); y++ ) {
				slots[x,y] = null;
			}
		}
	}
}
