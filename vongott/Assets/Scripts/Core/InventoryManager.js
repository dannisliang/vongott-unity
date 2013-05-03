#pragma strict

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
	var type : Item.Types = Item.Types.Equipment;
	var id : Item.IDs = Item.IDs.Pistol;
	var eqSlot : Equipment.Slots = Equipment.Slots.Hands;
	var upgSlot : Upgrade.Slots = Upgrade.Slots.Hands;
	var sprite : UISprite;
	var image : Texture2D;
	var title = "";
	var desc = "";
	var attr : Item.Attribute[];
	var equipped = false;
	var installed = false;
	var slot = 0;
	var mesh : Mesh;
	var materials : Material[];
}

// Static vars
static var slots = new Slot[16];
static var initialized = false;


////////////////////
// Static functions
////////////////////
// Get slots
static function GetSlots () { return slots; }


// Add item
static function AddItem ( item : Item ) {
	for ( var i = 0; i < slots.Length; i++ ) {
		if ( slots[i].GetEntry() == null ) {
			var entry = new Entry ();
			
			// translate item to entry
			entry.type = item.type;
			entry.id = item.id;
			
			if ( item.type == Item.Types.Equipment ) {
				var eq = item as Equipment;
				entry.eqSlot = eq.eqSlot;
			} else if ( item.type == Item.Types.Upgrade ) {
				var upg = item as Upgrade;
				entry.upgSlot = upg.upgSlot;
			}
			
			entry.image = item.image;
			entry.title = item.title;
			entry.desc = item.desc;
			entry.attr = item.attr;
			entry.slot = i;
			entry.mesh = item.gameObject.GetComponent(MeshFilter).mesh;
			entry.materials = item.gameObject.GetComponent(MeshRenderer).materials;
			
			slots[i].SetEntry ( entry );
			return;
		}
	}
}

// Eqip entry
static function EquipEntry ( entry : Entry, equip : boolean ) {
	var player : Player = GameCore.GetPlayerObject().GetComponent(Player);
	player.Equip ( entry, equip );
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
			
		initialized = true;
	}
}