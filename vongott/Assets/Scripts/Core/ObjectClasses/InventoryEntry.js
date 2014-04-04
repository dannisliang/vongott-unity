#pragma strict

class InventoryEntry {
	public var prefabPath : String;
	public var installed : boolean = false;
	public var activated : boolean = false;
	public var x : int;
	public var y : int;

	function InventoryEntry () {}
	
	function InventoryEntry ( item : Item ) {
		prefabPath = item.GetComponent(Prefab).path + "/" + item.GetComponent(Prefab).id;
	}

	function InventoryEntry ( item : Item, x : int, y : int ) {
		prefabPath = item.GetComponent(Prefab).path + "/" + item.GetComponent(Prefab).id;

		this.x = x;
		this.y = y;
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

	function get item () : Item {
		return GetItem ();
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

	override function get item () : Item {
		var entry : InventoryEntry = InventoryManager.GetInstance().GetEntry ( refX, refY );

		if ( entry ) {
			return entry.GetItem ();
		} else {
			return null;
		}
	}	
}
