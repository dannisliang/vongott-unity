#pragma strict

class InventoryManager extends MonoBehaviour {
	private var slots : InventoryEntry[,];
	private var stash : InventoryEntryReference[];

	public var credits : int = 0;
	public var equippedItem : Item;
	public var holsteredItem : Item;

	public static var instance : InventoryManager;


	////////////////////
	// Static functions
	////////////////////
	static function GetInstance () : InventoryManager {
		return instance;
	}

	// Equip/uneqip stash
	public function ToggleStash ( index : int ) {
		if ( GetActiveStash () == index ) {
			UnEquip ();

		} else if ( stash[index] != null ) {
			Equip ( stash[index].item );

		}
	}

	// Which is the active stash slot?
	public function GetActiveStash () : int {
		var result : int = -1;
		
		if ( stash ) {
			for ( var i : int = 0; i < stash.Length; i++ ) {
				if ( stash[i] && equippedItem == stash[i].item ) {
					result = i;
					break;
				}
			}
		}

		return result;
	}

	// Is equipped item a gun?
	public function HasEquippedGun() : boolean {
		if ( equippedItem ) {
			var eq : Equipment = equippedItem as Equipment;

			if ( eq ) {
				return true;
			} else {
				return false;
			}

		} else {
			return false;

		}
	}

	// Get slots
	public function GetSlots () : InventoryEntry[,] { return slots; }
	
	// Get slots
	public function GetStash () : InventoryEntryReference[] { return stash; }

	// Get entry
	public function GetEntry ( i : int  ) : InventoryEntry {
		if ( stash [i] ) {
			return slots [ stash[i].refX, stash[i].refY ];

		} else {
			return null;
		}
	}
	
	public function GetEntry ( x : int, y : int ) : InventoryEntry {
		if ( slots[x,y] != null ) {
			var slot : InventoryEntry = slots[x,y];
		
			if ( slot.GetType() == InventoryEntryReference ) {
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

	// Put items away and retrieve them
	public function HolsterItem () {
		holsteredItem = equippedItem;

		UnEquip ();
	}

	public function UnholsterItem () {
		if ( holsteredItem ) {
			Equip ( holsteredItem );
		}

		holsteredItem = null;
	}

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
	
		GameCore.Print ( "InventoryManager | Item '" + GetEntry ( refX, refY ).item.title + "' put in stash slot " + slot );
	}

	// Add item
	public function AddItem ( item : Item ) {
		for ( var x : int = 0; x < slots.GetLength(0); x++ ) {
			for ( var y : int = 0; y < slots.GetLength(1); y++ ) {
				if ( slots[x,y] == null ) {
					slots[x,y] = new InventoryEntry ( item, x, y );
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
	
		if ( toX >= slots.GetLength(0) || toY >= slots.GetLength(1) ) {
			GameCore.Print ( "InventoryManager | Out of range: " + toX + "," + toY + ", max: " + slots.GetLength(0) + "," + slots.GetLength(1) );
			return;
		}

		UpdateStashReference ( fromX, fromY, toX, toY );

		GameCore.Print ( "InventoryManager | Moved item '" + entry.item.title + "' from (" + fromX + "," + fromY + ") to (" + toX + "," + toY + ")" );
		
		slots[fromX,fromY] = null;
		slots[toX,toY] = entry;
		entry.x = toX;
		entry.y = toY;
	}

	// Change credits amount
	public function ChangeCredits ( amount : int ) {
		credits += amount;
	}

	// Equip item
	public function UnEquip () {
		if ( equippedItem != null ) {
			var player : Player = GameCore.GetPlayerObject().GetComponent(Player);
			player.DestroyEquipped ();
			
			GameCore.Print ( "InventoryManager | Unequipped " + equippedItem.title );
			
			equippedItem = null;
		}
	}

	public function Equip ( i : Item ) {
		UnEquip ();
		
		var player : Player = GameCore.GetPlayer();
		player.Equip ( i );
		
		equippedItem = i;
		
		GameCore.Print ( "InventoryManager | Equipped " + equippedItem.title );
	}

	// Remove entry
	public function RemoveEntry ( x : int, y : int, delete : boolean ) {
		if ( !delete ) {
			var droppedItem : Item = MonoBehaviour.Instantiate ( slots[x,y].item );
			droppedItem.transform.parent = GameCore.GetPlayerObject().transform.parent;
			droppedItem.transform.position = GameCore.GetPlayerObject().GetComponent(Player).hand.transform.position + ( GameCore.GetPlayerObject().transform.forward * 0.5 );
			droppedItem.transform.localEulerAngles = Vector3.zero;
			droppedItem.transform.localScale = Vector3.one;
		}
			
		if ( slots[x,y].item == equippedItem ) {
			UnEquip();
		}
					
		GameCore.Print ( "InventoryManager | Removed entry: " + slots[x,y] );
		slots[x,y] = null;
	}

	public function RemoveEntry ( e : InventoryEntry, delete : boolean ) {
		for ( var x : int = 0; x < slots.GetLength(0); x++ ) {
			for ( var y : int = 0; y < slots.GetLength(1); y++ ) {
				if ( slots[x,y] == e ) {
					RemoveEntry ( x, y, delete );
					FlagManager.SetItemFlag ( e.item, false );
					
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
