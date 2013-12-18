#pragma strict

import System.Collections.Generic;

class OGDropDown extends OGWidget {	
	// Classes
	public class DropDownItem {
		public var name : String;
		public var message : String;
		public var tickable : boolean = false;
		public var isTicked : boolean = false;
	}
	
	public class DropDownItemNested extends DropDownItem {
		public var tickOverrides : boolean = false;
	}
	
	public class DropDownItemRoot extends DropDownItem {
		public var nestedMenu : DropDownItemNested[];
	}
	
	// Vars
	public var title : String;
	public var target : GameObject;
	public var submenu : DropDownItemRoot[];
	public var isDown : boolean = false;

	private var container : GameObject;
	private var background : OGSlicedSprite;
	private var label : OGLabel;
	private var activeNestedMenu : int = -1;
	private var timeStamp : float;
	
	
	////////////////////
	// Interaction
	////////////////////
	override function OnMouseUp () {
		isDown = !isDown;

		SetDrawn ( isDrawn );
	}
	
	private function SelectItem ( item : DropDownItem ) {
		/*if ( item.GetType() == DropDownItemRoot && ( item as DropDownItemRoot ).nestedMenu.Length > 0 ) {
			if ( currentNestedMenu != ( item as DropDownItemRoot ).nestedMenu ) {
				currentNestedMenu = ( item as DropDownItemRoot ).nestedMenu;
				isNestedDown = true;
			} else {
				currentNestedMenu = null;
				isNestedDown = false;
			}
		
		} else {
			if ( item.tickable && item.GetType() == DropDownItemNested && ( item as DropDownItemNested ).tickOverrides && currentNestedMenu != null ) {
				for ( var i : DropDownItemNested in currentNestedMenu ) {
					if ( i == item ) {
						item.isTicked = true;
					} else {
						i.isTicked = false;
					}
				}
				
				
			} else if ( item.tickable ) {
				item.isTicked = !item.isTicked;
			}
		
			if ( target && item.message ) {
				target.SendMessage ( item.message );
			}
		}*/
	}

	// Select item
	public function SelectItem ( n : String ) {
		var i : int = int.Parse ( n );

		for ( var o : int = 0; o < container.transform.childCount; o++ ) {
			container.transform.GetChild(o).Find("Button").GetComponent(OGListItem).selected = o == i;
		}

		if ( submenu[i].nestedMenu.Length > 0 ) {
			activeNestedMenu = i;
		} else {
			activeNestedMenu = -1;
		}

		SetDrawn ( isDrawn );
	}

	// Select nested item
	public function SelectNestedItem ( n : String ) {
		var i : int = int.Parse ( n );
		var item : DropDownItemNested = submenu[activeNestedMenu].nestedMenu[i];
	
		if ( item.tickable ) {
			if ( item.tickOverrides ) {
				for ( var o : int = 0; o < submenu[activeNestedMenu].nestedMenu.Length; o++ ) {
					submenu[activeNestedMenu].nestedMenu[o].isTicked = o == i;
				}
			} else {
				item.isTicked = !item.isTicked;
			}
		}

		if ( !String.IsNullOrEmpty ( item.message ) ) {
			target.SendMessage ( item.message );
		}

		SetDirty ();
	}
	
	
	////////////////////
	// Set drawn
	////////////////////
	override function SetDrawn ( drawn : boolean ) {
		var i : int = 0;
		var o : int = 0;
		var lbl : OGLabel;
		
		isDrawn = drawn;
		
		label.isDrawn = isDrawn;	
		background.isDrawn = isDown && isDrawn;			
	
		// Submenu
		for ( i = 0; i < container.transform.childCount; i++ ) {
			var entry : Transform = container.transform.GetChild(i);
			var button : OGListItem = entry.Find("Button").GetComponent(OGListItem);	
			button.SetDrawn ( isDrawn && isDown );

			// Nested
			var nested : Transform = entry.Find("NestedMenu");
			var thisActive : boolean = i == activeNestedMenu;
			for ( o = 0; o < nested.childCount; o++ ) {
				var btn : OGListItem = nested.GetChild(o).GetComponent(OGListItem);
				btn.SetDrawn ( isDrawn && isDown && thisActive );	
			}

			var bg : OGSlicedSprite = entry.Find("Background").GetComponent(OGSlicedSprite);	
			bg.isDrawn = isDrawn && isDown && thisActive;
		}

		SetDirty ();
	}

	
	////////////////////
	// Build 
	////////////////////
	override function Build () {
		isSelectable = true;
		
		var i : int = 0;
		var o : int = 0;

		// Submenu container
		if ( !container && !FindChild("Submenu") ) {
			container = new GameObject ( "Submenu" );
			container.transform.parent = this.transform;
			container.transform.localPosition = new Vector3 ( 0, 1.1, 0 );
			container.transform.localScale = Vector3.one;
			container.transform.localEulerAngles = Vector3.zero;
		
		} else if ( container == null ) {
			container = FindChild("Submenu");
		}

		// Submenu
		if ( submenu == null ) {
			submenu = new DropDownItemRoot[0];
		}
		
		// ^ Edit existing or create new ones
		for ( i = 0; i < submenu.Length; i++ ) {
			// Entry container
			var entry : Transform;

			if ( i < container.transform.childCount ) {
				entry = container.transform.GetChild(i);
			} else {
				entry = new GameObject ( i + ": " + submenu[i].name ).transform;
				entry.parent = container.transform;
			}

			entry.gameObject.name = i + ": " + submenu[i].name;
			entry.localPosition = new Vector3 ( 0, i, 0 );
			entry.localEulerAngles = Vector3.zero;
			entry.localScale = Vector3.one;

			// Entry button
			var button : OGListItem;

			if ( entry.Find("Button") ) {
				button = entry.Find("Button").GetComponent(OGListItem);
			} else {
				button = new GameObject ( "Button", OGListItem ).GetComponent(OGListItem);
				button.transform.parent = entry;
			}

			button.transform.localPosition = Vector3.zero;
			button.transform.localScale = Vector3.one;
			button.transform.localEulerAngles = Vector3.zero;
			
			button.text = submenu[i].name;
			button.target = this.gameObject;
			button.message = "SelectItem";
			button.argument = i.ToString();
			button.hidden = true;
			button.styles.basic = this.styles.basic;
			button.styles.active = this.styles.active;

			// Nested menu container
			var nested : Transform;

			if ( entry.Find("NestedMenu") ) {
				nested = entry.Find("NestedMenu").transform;
			} else {
				nested = new GameObject ( "NestedMenu" ).transform;
				nested.parent = entry;
			}

			nested.localPosition = new Vector3 ( 1, 0, 0 );
			nested.localScale = Vector3.one;
			nested.localEulerAngles = Vector3.zero;

			// Submenu
			// ^ Edit existing or create new ones
			for ( o = 0; o < submenu[i].nestedMenu.Length; o++ ) {
				var btn : OGListItem;
				var nestedItem : DropDownItemNested = submenu[i].nestedMenu[o];

				if ( o < nested.childCount ) {
					btn = nested.GetChild(o).GetComponent(OGListItem);
				} else {
					btn = new GameObject ( "", OGListItem ).GetComponent(OGListItem);
					btn.transform.parent = nested;
				}

				btn.gameObject.name = o + ": " + nestedItem.name;
				btn.text = nestedItem.name;
				btn.target = this.gameObject;
				btn.message = "SelectNestedItem";
				btn.argument = o.ToString();
				btn.hidden = true;
				btn.styles.basic = this.styles.basic;
				btn.styles.active = this.styles.active;

				btn.transform.localScale = Vector3.one;
				btn.transform.localPosition = new Vector3 ( 0, o, 0 );
				btn.transform.localEulerAngles = Vector3.zero;
			}

			// ^ Destroy remaining
			if ( nested.childCount > submenu[i].nestedMenu.Length ) {
				for ( o = submenu[i].nestedMenu.Length; o < nested.childCount; o++ ) {
					DestroyImmediate ( nested.GetChild(o).gameObject );
				}
			}

			// Nested background
			var bg : OGSlicedSprite;

			if ( entry.Find("Background") ) {
				bg = entry.Find("Background").GetComponent(OGSlicedSprite);
			} else {
				bg = new GameObject ( "Background", OGSlicedSprite ).GetComponent(OGSlicedSprite);
				bg.transform.parent = entry;
			}

			bg.styles.basic = this.styles.background;
			bg.transform.localPosition = new Vector3 ( 1, 0, 0 );
			if ( nested.childCount < 1 ) {
				bg.transform.localScale = Vector3.one;
			} else {
				bg.transform.localScale = new Vector3 ( 1, nested.childCount, 1 );
			}
			bg.transform.localEulerAngles = Vector3.zero;
			bg.hidden = true;
		}

		// ^ Destroy remaining
		if ( container.transform.childCount > submenu.Length ) {
			for ( i = submenu.Length; i < container.transform.childCount; i++ ) {
				DestroyImmediate ( container.transform.GetChild(i).gameObject );
			}
		}

		// Background
		if ( background == null ) {
			if ( this.transform.Find( "SlicedSprite" ) ) {
				background = this.transform.Find( "SlicedSprite" ).GetComponent(OGSlicedSprite);
				
			} else {			
				var newSprite : OGSlicedSprite = new GameObject ( "SlicedSprite", OGSlicedSprite ).GetComponent ( OGSlicedSprite );
				newSprite.transform.parent = this.transform;
				background = newSprite;
			}
		}
			
		background.transform.localEulerAngles = Vector3.zero;
		background.transform.localPosition = Vector3.zero;
		
		background.hidden = true;

		background.styles.basic = styles.background;
		background.transform.localPosition = new Vector3 ( 0, 1, 0 );
		
		background.transform.localScale = new Vector3 ( 1, container.transform.childCount + 0.2, 1 );
		
		// Label
		if ( label == null ) {
			if ( this.gameObject.GetComponentInChildren ( OGLabel ) ) {
				label = this.gameObject.GetComponentInChildren ( OGLabel );
				
			} else {				
				var newLabel : OGLabel = new GameObject ( "Label", OGLabel ).GetComponent ( OGLabel );
				newLabel.transform.parent = this.transform;
				label = newLabel;
			}
		}

		label.text = title;
		label.styles.basic = this.styles.basic;		
		
		label.transform.localScale = new Vector3 ( ( label.lineWidth + label.styles.basic.text.padding.left + label.styles.basic.text.padding.right + 5 ) / this.transform.lossyScale.x, 1, 1 );
		label.transform.localEulerAngles = Vector3.zero;
		label.transform.localPosition = Vector3.zero;
		
		label.hidden = true;

		// Set drawn
		SetDrawn ( isDrawn );		
	}


	////////////////////
	// Update
	////////////////////
	override function UpdateWidget () {
		// Null check
		if ( !background || !label || !container ) {
			Build ();
			return;
		}

		// Mouse
		mouseRct = label.drawRct;
	}
}
