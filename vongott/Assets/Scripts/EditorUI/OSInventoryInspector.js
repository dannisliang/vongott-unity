#pragma strict

public class OSInventoryInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( OSInventory ); }

	private var xSelected : int;
	private var ySelected : int;

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

		offset.y += 10;

		// Items
		LabelField ( "Items" );
		
		offset.y += 20;

		var size : float = width / inventory.grid.width;
		var skip : boolean [ , ] = inventory.grid.GetSkippedSlots();
		
		for ( var x : int = 0; x < inventory.grid.width; x++ ) {
			for ( var y : int = 0; y < inventory.grid.height; y++ ) {
				var slot : OSSlot = inventory.GetSlot ( x, y ); 
					
				if ( skip [ x, y ] == true ) {
					continue;
				
				} else if ( slot && slot.item ) {
					if ( Button ( "", new Rect ( x * size, offset.y + y * size, size * slot.scale.x, size * slot.scale.y ) ) ) {
						xSelected = x;
						ySelected = y;
					}
					
					if ( slot.item.preview ) {
						Texture ( slot.item.preview, new Rect ( x * size, offset.y + y * size, size * slot.scale.x, size * slot.scale.y ) );
					}
				
				} else {
					if ( Button ( "", new Rect ( x * size, offset.y + y * size, size, size ) ) ) {
						xSelected = x;
						ySelected = y;
					}

				}
			}
		}

		offset.y += inventory.grid.height * size;

		slot = inventory.GetSlot ( xSelected, ySelected );
	
		if ( slot && slot.item ) {
			LabelField ( slot.item.id );

			if ( Button ( "Remove", new Rect ( width / 2, offset.y, width / 2, 16 ) ) ) {
				inventory.RemoveItem ( slot.item );
			}
		
			offset.y += 20;
		}

		if ( Button ( "Add item" ) ) {
			OEWorkspace.GetInstance().PickPrefab ( function ( picked : GameObject ) {
				var item : OSItem = picked.GetComponent.< OSItem > ();

				if ( item ) {
					inventory.AddItem ( item );
				}

				OEWorkspace.GetInstance().toolbar.Clear ();
			}, typeof ( OSItem ) );
		}
	}	
}
