////////////////////
// Prerequisites
////////////////////
// Enums
enum ItemTypes {
	Equipment,
	Consumable
}

enum ItemIDs {
	Pistol,
	Baton,
	Tazer,
	AssaultRifle,
	DartGun
}

// Classes
public class Item {
	var type = ItemTypes.Equipment;
	var id = ItemIDs.Pistol;
	var sprite_name = "";
	var name = "";
	var desc = "";
	
	function Item ( t : ItemTypes, i : ItemIDs, d : String ) {
		type = t;
		id = i;
		name = i.ToString();
		
		var prefix = "eq";
		if ( t == ItemTypes.Consumable ) { prefix = "c"; }
		sprite_name = prefix + "_" + name.ToLower();
		
		desc = d;
	}
}

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
	slots[0].item = new Item( ItemTypes.Equipment, ItemIDs.Pistol, "This is an ordinary pistol" );
	slots[1].item = new Item( ItemTypes.Equipment, ItemIDs.Baton, "This is an electrical baton" );
	slots[2].item = new Item( ItemTypes.Equipment, ItemIDs.Tazer, "This is an electrical tazer" );
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