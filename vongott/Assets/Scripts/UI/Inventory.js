////////////////////
// Prerequisites
////////////////////

// Inspector items
var atlas_ui : UIAtlas;
var grid : GameObject;
var item_name : UILabel;
var item_desc : UILabel;

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
		
		if ( slots[i].item ) {
			slot.GetComponent(UISprite).spriteName = slots[i].item.spriteName;
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

// Select slot
function SelectSlot ( sender : GameObject ) {
	var index = int.Parse ( sender.name );
	var slots = InventoryManager.GetSlots();
	
	if ( slots[index].item ) {
		item_name.text = slots[index].item.title;
		item_desc.text = slots[index].item.desc;
	}
}


////////////////////
// Init
////////////////////
function Start () {
	PopulateGrid();
}


////////////////////
// Update
////////////////////
function Update () {
	if ( Input.GetKeyDown(KeyCode.Escape) ) {
		PageManager.GoToPage ( "HUD" );
	}
}