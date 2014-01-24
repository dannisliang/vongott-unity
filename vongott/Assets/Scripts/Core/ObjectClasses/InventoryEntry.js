#pragma strict

class InventoryEntry {
	var prefabPath : String;
	var installed : boolean = false;
	var activated : boolean = false;

	function InventoryEntry () {}

	function InventoryEntry ( item : Item ) {
		prefabPath = item.GetComponent(Prefab).path + "/" + item.GetComponent(Prefab).id;
	}

	function InventoryEntry ( path : String ) {
		prefabPath = path;
	}

	function GetItem () : Item {
		var obj : GameObject = Resources.Load ( prefabPath ) as GameObject;
		
		if ( obj ) {
			return obj.GetComponent ( Item );
		
		} else {
			return null;
		
		}
	}
	
	function GetUpgrade () : Upgrade {
		var item : Item = GetItem();
		
		if ( item && item.GetComponent ( Upgrade ) ) {
			return item.GetComponent ( Upgrade );
		
		} else {
			return null;
			
		}
	}
}

class InventoryEntryReference extends InventoryEntry {
	var refX : int = -1;
	var refY : int = -1;
	
	function InventoryEntryReference ( a : int, b : int ) {
		refX = a;
		refY = b;
	}
}
