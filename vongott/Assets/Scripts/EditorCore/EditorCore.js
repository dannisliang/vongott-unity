#pragma strict

import System.Collections.Generic;

// Public vars
var workspace : Transform;

// Static vars
static var menusActive = false;
static private var selected_objects : List.<GameObject> = new List.<GameObject>();


////////////////////
// Static functions
////////////////////
// Toggle isometric view
static function ToggleIsometric () {
	Camera.main.orthographic = !Camera.main.orthographic;
	Camera.main.orthographicSize = 50;
}

// Toggle wireframe view
static function ToggleWireframe () {
	if ( Camera.main.GetComponent(EditorCamera).renderMode == 1 ) {
		Camera.main.GetComponent(EditorCamera).renderMode = 0;
	} else {
		Camera.main.GetComponent(EditorCamera).renderMode = 1;
	}
}

// Toggle texture view
static function ToggleTextured () {
//	DrawCameraMode.Textured = !DrawCameraMode.Textured;
}

// Get selected objects
static function GetSelectedObjects () : List.<GameObject> {
	return selected_objects;
}

// Is object selected?
static function IsObjectSelected ( obj : GameObject ) : boolean {
	for ( var o in selected_objects ) {
		if ( o == obj ) {
			return true;
		}
	}
	
	return false;
}

// Deselect all
static function DeselectAllObjects () {
	for ( var i = 0; i < selected_objects.Count; i++ ) {
		DeselectObject ( selected_objects[i] );
	}
}

// Deselect object
static function DeselectObject ( obj : GameObject ) {
	selected_objects.Remove ( obj );
	
	obj.renderer.material.color = Color.white;
}

// Select object
static function SelectObject ( obj : GameObject ) {
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