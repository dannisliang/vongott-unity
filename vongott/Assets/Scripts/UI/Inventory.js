////////////////////
// Prerequisites
////////////////////
// Public vars
var atlas_ui : UIAtlas;
var grid : GameObject;
var entry_name : UILabel;
var entry_desc : UILabel;
var entry_attr_type : UILabel;
var entry_attr_val : UILabel;
var btn_equip : GameObject;
var btn_discard : GameObject;
var highlight : GameObject;

// Private vars
private var selected_entry : Entry;

////////////////////
// Private functions
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
	obj.transform.localPosition = new Vector3 ( x * -(size+2), y * -(size+2), 0 );
	
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
			slots[i].entry.sprite = slot.GetComponent(UISprite);
			if ( slots[i].entry.equipped ) {
				Equip ( slots[i].entry, true );
			} else if ( slots[i].entry.installed ) {
				Install ( slots[i].entry, true );
			}
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

// Clear grid
private function ClearGrid () {
	for ( var i = 0; i < grid.transform.childCount; i++ ) {
		Destroy ( grid.transform.GetChild(i).gameObject );
	}
}

// Set button functions
private function SetButtons ( btn1 : String, btn2 : String ) {
	if ( btn1 != null ) {
		btn_discard.SetActive ( true );
		btn_discard.transform.GetChild(0).gameObject.GetComponent(UILabel).text = btn1;
	} else {
		btn_discard.SetActive ( false );
	}
	
	if ( btn2 != null ) {
		btn_equip.SetActive ( true );
		btn_equip.transform.GetChild(0).gameObject.GetComponent(UILabel).text = btn2;
	} else {
		btn_equip.SetActive ( false );
	}
}

// Reset inspector
private function ResetInspector () {
	entry_name.text = "";
	entry_desc.text = "";
	entry_attr_type.text = "";
	entry_attr_val.text = "";
	SetButtons ( null, null );
	highlight.SetActive ( false );
}


// Init buttons
private function InitButtons () {
	btn_equip.GetComponent(UIButtonMessage).target = this.gameObject;
	btn_discard.GetComponent(UIButtonMessage).target = this.gameObject;
}

// Equip entry
private function Equip ( entry : Entry, equip : boolean ) {
	entry.equipped = equip;
	
	if ( equip ) {
		entry.sprite.alpha = 0.5;
	} else {
		entry.sprite.alpha = 1.0;
	}
}

// Install entry
private function Install ( entry : Entry, install : boolean ) {
	entry.installed = install;
	
	if ( install ) {
		entry.sprite.alpha = 0.5;
	} else {
		entry.sprite.alpha = 1.0;
	}
}


//////////////////
// Public functions
//////////////////
// Equip button press
function BtnEquip () {
	if ( selected_entry.type == Item.Types.Equipment ) {
		if ( !selected_entry.equipped ) {
			Equip ( selected_entry, true );
			InventoryManager.EquipEntry ( selected_entry, true );
			SetButtons ( null, "Unequip" );
		} else {
			Equip ( selected_entry, false );
			InventoryManager.EquipEntry ( selected_entry, false );
			SetButtons ( "Discard", "Equip" );
		}

	} else if ( selected_entry.type == Item.Types.Upgrade ) {
		if ( !selected_entry.installed ) {
			Install ( selected_entry, true );
			UpgradeManager.InstallEntry ( selected_entry, true );
			SetButtons ( null, "Uninstall" );
		} else {
			Install ( selected_entry, false );
			UpgradeManager.InstallEntry ( selected_entry, false );
			SetButtons ( "Discard", "Install" );
		}
	}
}

// Discard button press
function BtnDiscard () {
	InventoryManager.RemoveEntry ( selected_entry );
	ResetInspector ();
	ClearGrid ();
	PopulateGrid ();
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
		
		if ( entry.type == Item.Types.Equipment ) {
			if ( !entry.equipped ) {
				SetButtons ( "Discard", "Equip" );
			} else {
				SetButtons ( null, "Unequip" );
			}
		} else if ( entry.type == Item.Types.Upgrade ) {
			if ( !entry.installed ) {
				SetButtons ( "Discard", "Install" );
			} else {
				SetButtons ( null, "Uninstall" );
			}
		} else {
			SetButtons ( null, null );
		}
		
		selected_entry = entry;
		
		highlight.SetActive ( true );
		highlight.transform.position = sender.transform.position;
	}
}

// Init
function Start () {
	InitButtons ();
	PopulateGrid();
	ResetInspector();
	
	CameraTarget.TurnCam ( true );
}


// Update
function Update () {
	if ( Input.GetKeyDown(KeyCode.Escape) ) {
		PageManager.GoToPage ( "HUD" );
		CameraTarget.TurnCam ( false );
	}
}