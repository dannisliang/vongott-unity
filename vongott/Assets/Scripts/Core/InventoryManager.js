////////////////////
// Prerequisites
////////////////////
// Classes
public class Slot {
	var index = 0;
	var entry : Entry;
	
	function Slot ( i : int, e : Entry ) {
		index = i;
		entry = e;
	}

	function SetEntry ( e : Entry ) { entry = e; }
	
	function GetEntry () { return entry; }
}

public class Entry {
	var type = Item.Types.Equipment;
	var id = Item.IDs.Pistol;
	var eqSlot = Item.EquipmentSlots.Hands;
	var sprite : UISprite;
	var spriteName = "";
	var title = "";
	var desc = "";
	var attr : Item.Attribute[];
	var equipped = false;
	var slot = 0;
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
		if ( slots[i].GetEntry() == null ) {
			var entry = new Entry ();
			
			// translate item to entry
			entry.type = item.type;
			entry.id = item.id;
			entry.eqSlot = item.eqSlot;
			entry.spriteName = item.spriteName;
			entry.title = item.title;
			entry.desc = item.desc;
			entry.attr = item.attr;
			entry.slot = i;
			
			slots[i].SetEntry ( entry );
			return;
		}
	}
}

// Remove entry
static function RemoveEntry ( entry : Entry ) {
	slots[entry.slot].SetEntry ( null );
	Debug.Log ( "InventoryManager | removed entry: " + entry.title );
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