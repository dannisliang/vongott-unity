////////////////////
// Prerequisites
////////////////////

// Inspector entries
var atlas_ui : UIAtlas;
var grid : GameObject;
var entry_name : UILabel;
var entry_desc : UILabel;
var entry_attr_type : UILabel;
var entry_attr_val : UILabel;

// Private vars


////////////////////
// Inventory functions
////////////////////
// Create slot
private function CreateSlot ( i : int, x : int, y : int ) {
	var obj = new GameObject();
	var sprite = obj.AddComponent(UISprite);
	var collider = obj.AddComponent(BoxCollider);
	var message = obj.AddComponent(UIButtonMessage);
	var size = 96;
	
	sprite.atlas = atlas_ui;
	sprite.spriteName = "";
	
	collider.isTrigger = true;
	collider.center = Vector3.zero;
	collider.size = Vector3.one;
	
	message.target = this.gameObject;
	message.functionName = "SelectSlot";
	
	obj.layer = 8;
	obj.name = i.ToString();
	obj.transform.parent = grid.transform;
	obj.transform.localScale = new Vector3 ( size, size, 1 );
	obj.transform.localPosition = new Vector3 ( x * (size+2), y * (size+2), 0 );
	
	return obj;
}

// Populate grid
private function PopulateGrid () {
	var slots = InventoryManager.GetSlots();

	var row = 0;
	var col = 0;

	for ( var i = 0; i < slots.Length; i++ ) {
		var slot = CreateSlot ( i, col, row );
		
		if ( slots[i].entry ) {
			slot.GetComponent(UISprite).spriteName = slots[i].entry.spriteName;
		} else {
			slot.GetComponent(UISprite).spriteName = "empty";
		}
		
		if ( col < 5 ) {
			col++;
		} else {
			col = 0;
			row++;
		}
	}
}

// Reset inspector
function ResetInspector () {
	entry_name.text = "";
	entry_desc.text = "";
	entry_attr_type.text = "";
	entry_attr_val.text = "";
}

// Select slot
function SelectSlot ( sender : GameObject ) {
	var index = int.Parse ( sender.name );
	var slots = InventoryManager.GetSlots();
	
	if ( slots[index].entry ) {
		var entry = slots[index].entry;
		
		entry_name.text = entry.title;
		entry_desc.text = entry.desc;
		entry_attr_type.text = "";
		entry_attr_val.text = "";
		
		for ( var a : Item.Attribute in entry.attr ) {
			entry_attr_type.text += a.type.ToString() + ": \n";
			entry_attr_val.text += a.val.ToString() + "\n";
		}
	}
}


////////////////////
// Init
////////////////////
function Start () {
	PopulateGrid();
	ResetInspector();
}


////////////////////
// Update
////////////////////
function Update () {
	if ( Input.GetKeyDown(KeyCode.Escape) ) {
		PageManager.GoToPage ( "HUD" );
	}
}