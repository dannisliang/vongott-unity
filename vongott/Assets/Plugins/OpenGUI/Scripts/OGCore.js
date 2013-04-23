#pragma strict

import System.Collections.Generic;

// Booleans
static var mouseOver = false;

// List of widgets
static var all_widgets : List.<OGWidget> = new List.<OGWidget>();

// Add widget
static function Add ( widget : OGWidget ) {
	all_widgets.Add ( widget );
	
	return widget;
}

// Clear widgets
static function ClearWidgets () {
	for ( var i = 0; i < all_widgets.Count; i++ ) {
		all_widgets.RemoveAt (i);
	}
	
	all_widgets = new List.<OGWidget>();
}

// Update
static function Update () {
	OGPageManager.Update ();
	
	for ( var i = 0; i < all_widgets.Count; i++ ) {
		all_widgets[i].Update ();
	}
}

// Draw widgets
static function DrawWidgets () {
	for ( var i = 0; i < all_widgets.Count; i++ ) {
		all_widgets[i].Draw ();
	}
}