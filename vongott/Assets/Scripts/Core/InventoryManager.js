////////////////////
// Prerequisites
////////////////////
// Classes
public class Slot {
	var index = 0;
	var item : Item;
	
	function Slot ( i : int, it : Item ) {
		index = i;
		item = it;
	}

	function SetItem ( it : Item ) { item = it; }
	
	function GetItem () { return item; }
}

// Static vars
static var slots = new Slot[30];
static var initialized = false;


////////////////////
// Inventory actions
////////////////////
// Get slots
static function GetSlots () { return slots; }

// Test items
static function LoadTestItems () {
	
}

// Add item
static function AddItem ( item : Item ) {
	for ( var i = 0; i < slots.Length; i++ ) {
		if ( slots[i].GetItem() == null ) {
			slots[i].SetItem ( item );
			return;
		}
	}
}

// Init inventory
static function Init () {
	if ( !initialized ) {
		for ( var i = 0; i < slots.Length; i++ ) {
			slots[i] = new Slot ( i, null );
		}
		
		LoadTestItems();	
	
		initialized = true;
	}
}