﻿#pragma strict

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
		var addButtonPlaced : boolean = false;

		for ( var y : int = 0; y < inventory.grid.height; y++ ) {
			for ( var x : int = 0; x < inventory.grid.height; x++ ) {
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
				
				} else if ( !addButtonPlaced ) {
					if ( Button ( "Add item", new Rect ( x * size, offset.y + y * size, size, size ) ) ) {
						OEWorkspace.GetInstance().PickPrefab ( function ( picked : GameObject ) {
							var item : OSItem = picked.GetComponent.< OSItem > ();

							if ( item ) {
								inventory.AddItem ( item );
							}

							OEWorkspace.GetInstance().toolbar.Clear ();
						}, typeof ( OSItem ) );
					}
					addButtonPlaced = true;

				}
			}
		}

		offset.y += inventory.grid.height * size;

		slot = inventory.GetSlot ( xSelected, ySelected );
	
		if ( slot && slot.item ) {
			LabelField ( slot.item.id );
			slot.item.ammunition.value = IntField ( "Ammunition", slot.item.ammunition.value );

			if ( Button ( "Remove" ) ) {
				inventory.RemoveItem ( slot.item );
			}
		
			offset.y += 20;
		}

	}	
}
