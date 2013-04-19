#pragma strict

import System.Collections.Generic;

// Public vars
var workspace : Transform;

// Private vars
private var selected_objects : List.<GameObject> = new List.<GameObject>();

// Static vars
static var menusActive = false;


////////////////////
// Public functions
////////////////////
// Get selected objects
function GetSelectedObjects () : List.<GameObject> {
	return selected_objects;
}

// Is object selected?
function IsObjectSelected ( obj : GameObject ) : boolean {
	for ( var o in selected_objects ) {
		if ( o == obj ) {
			return true;
		}
	}
	
	return false;
}

// Deselect all
function DeselectAllObjects () {
	for ( var i = 0; i < selected_objects.Count; i++ ) {
		DeselectObject ( selected_objects[i] );
	}
}

// Deselect object
function DeselectObject ( obj : GameObject ) {
	selected_objects.Remove ( obj );
	
	obj.renderer.material.color = Color.white;
}

// Select object
function SelectObject ( obj : GameObject ) {
	selected_objects.Add ( obj );
	
	obj.renderer.material.color = Color.green;
}

// Init
function Start () {

}

// Update
function Update () {
	EditorInput.Update ();
}