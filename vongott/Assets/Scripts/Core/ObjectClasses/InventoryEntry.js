#pragma strict

class InventoryEntry {
	var prefabPath : String;
	var equipped : boolean = false;
	var installed : boolean = false;
	var activated : boolean = false;

	function InventoryEntry ( item : Item ) {
		prefabPath = item.GetComponent(Prefab).path + "/" + item.GetComponent(Prefab).id;
	}

	function InventoryEntry ( path : String ) {
		prefabPath = path;
	}

	function GetItem () : Item {
		var obj : GameObject = Resources.Load ( prefabPath ) as GameObject;
		var item = obj.GetComponent ( Item );
		return item;
	}
}