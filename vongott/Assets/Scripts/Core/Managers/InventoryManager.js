#pragma strict

////////////////////
// Prerequisites
////////////////////
// Static vars
static var slots : Dictionary.< int, InventoryEntry > = new Dictionary.< int, InventoryEntry >();
static var capacity : int = 16;


////////////////////
// Static functions
////////////////////
// Get slots
static function GetSlots () { return slots; }

// Add item
static function AddItem ( item : Item ) {
	for ( var i = 0; i < capacity; i++ ) {
		if ( slots[i] == null ) {
			slots[i] = new InventoryEntry ( item );
			
			return;
		}
	}
}

// Eqip entry
static function Equip ( i : Item, equip : boolean ) {
	var player : Player = GameCore.GetPlayerObject().GetComponent(Player);
	player.Equip ( Instantiate (i) as Item, equip );
}

// Remove entry
static function RemoveEntry ( i : int ) {
	GameCore.Print ( "InventoryManager | removed entry: " + i );
	slots[i] = null;
}

// Init inventory
static function Init () {
	for ( var i = 0; i < capacity; i++ ) {
		slots.Add ( i, null );
	}
}

// Clear
static function Clear () {
	slots.Clear();
}