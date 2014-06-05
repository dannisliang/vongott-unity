#pragma strict

public class OSInventoryInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( OSInventory ); }
	
	override function Inspector () {
		var inventory : OSInventory = target.GetComponent.< OSInventory >();
		
		// Currency amounts
		for ( var i : int = 0; i < inventory.definitions.currencies.Length; i++ ) {
			var def : OSCurrency = inventory.definitions.currencies[i];
			
			inventory.CheckCurrency ( i );

			var oldAmount : int = inventory.GetCurrencyAmount ( def.name );
			var newAmount : int = IntField ( def.name, oldAmount );
		
			if ( oldAmount != newAmount ) {
				inventory.SetCurrencyAmount ( def.name, newAmount );
			}
		}

		// Items
		for ( i = 0; i < inventory.slots.Count; i++ ) {
			inventory.slots[i].item = ObjectField ( i.ToString(), inventory.slots[i].item, typeof ( OSItem ), OEObjectField.Target.Prefab ) as OSItem;
		}
	}	
}
