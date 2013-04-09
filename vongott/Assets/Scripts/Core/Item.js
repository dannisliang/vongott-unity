class Item extends InteractiveObject {
	// Enums
	enum Types {
		Equipment,
		Consumable
	}
	
	enum IDs {
		Pistol,
		Baton,
		Tazer,
		AssaultRifle,
		DartGun
	}
	
	var type = Types.Equipment;
	var id = IDs.Pistol;
	var spriteName = "";
	var title = "";
	var desc = "";

	function Update () {
		if ( HUD.showing && GameCore.GetInteractiveObject() == this.gameObject ) {
			if ( !HUD.notification.active ) {
				HUD.ShowNotification ( "Pick up " + this.title + " [F]" );
			}
			
			if ( Input.GetKeyDown(KeyCode.F) ) {
				InventoryManager.AddItem(this);
				this.gameObject.SetActive ( false );
			}
		}
	}
}