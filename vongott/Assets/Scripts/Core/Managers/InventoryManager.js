#pragma strict

////////////////////
// Prerequisites
////////////////////
// Static vars
static var slots : InventoryEntry[] = new InventoryEntry[16];
static var credits : int = 0;


////////////////////
// Static functions
////////////////////
// Get slots
static function GetSlots () : InventoryEntry[] { return slots; }

// Get credits
static function GetCredits() : int { return credits; }

// Add item
static function AddItem ( item : Item ) {
	for ( var i = 0; i < slots.Length; i++ ) {
		if ( slots[i] == null ) {
			slots[i] = new InventoryEntry ( item );
			
			return;
		}
	}
}

// Change credits amount
static function ChangeCredits ( amount : int ) {
	credits += amount;
}

// Eqip entry
static function Equip ( i : Item, equip : boolean ) {
	var player : Player = GameCore.GetPlayerObject().GetComponent(Player);
	player.Equip ( Instantiate (i) as Item, equip );
}

// Remove entry
static function RemoveEntry ( i : int ) {
	var droppedItem : Item = Instantiate ( slots[i].GetItem() );
	droppedItem.transform.parent = GameCore.GetPlayerObject().transform.parent;
	droppedItem.transform.position = GameCore.GetPlayerObject().GetComponent(Player).torso.transform.position + ( GameCore.GetPlayerObject().transform.forward * 0.5 );
	droppedItem.transform.localEulerAngles = Vector3.zero;
	droppedItem.transform.localScale = Vector3.one;
	
	if ( slots[i].equipped ) {
		GameCore.GetPlayerObject().GetComponent(Player).Equip ( null, false );
	}
				
	GameCore.Print ( "InventoryManager | Removed entry: " + slots[i] );
	slots[i] = null;
}

static function RemoveEntry ( e : InventoryEntry ) {
	for ( var i = 0; i < slots.Length; i++ ) {
		if ( slots[i] == e ) {
			RemoveEntry ( i );
			return;
		}
	}
}

// Init inventory
static function Init () {

}

// Clear
static function Clear () {
	for ( var i = 0; i < slots.Length; i++ ) {
		slots[i] = null;
	}
}