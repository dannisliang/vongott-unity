#pragma strict

import System.Collections.Generic;

// Public vars
var _workspace : Transform;
var _gizmo : GameObject;
var _camera : Transform;

// Static vars
static var menusActive = false;
static private var selectedObjects : List.<GameObject> = new List.<GameObject>();
static var currentLevel : GameObject;
static var grabMode = false;
static var grabRestrict : String;
static var workspace : Transform;
static var cam : Transform;
static var gizmo : GameObject;
static var selectedMaterial : Material;
static var previousMaterials : List.< KeyValuePair.< GameObject, Material > >;
static var inspector : EditorMenuBase;
static var player : GameObject;
static var camTarget : GameObject;
static var root : Transform;


////////////////////
// Add
////////////////////
// Add light
static function AddLight () {
	var distance : float = 10.0;
	var forward = Camera.main.transform.TransformDirection ( Vector3.forward );
	var position = Camera.main.transform.position + forward * distance;
	
	var newLight : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/light_source" ) as GameObject );
	newLight.transform.parent = currentLevel.transform;
	newLight.transform.position = position;
}


////////////////////
// View
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


////////////////////
// Select objects
////////////////////
// Get selected objects
static function GetSelectedObjects () : List.<GameObject> {
	return selectedObjects;
}

// Delete selected objects
static function DeleteSelected () {
	for ( var i = 0; i < selectedObjects.Count; i++ ) {
		var obj : GameObject = selectedObjects[i];
		
		DeselectObject ( obj );
		Destroy ( obj );
	}
}

// Is object selected?
static function IsObjectSelected ( obj : GameObject ) : boolean {
	for ( var o in selectedObjects ) {
		if ( o == obj ) {
			return true;
		}
	}
	
	return false;
}

// Deselect all
static function DeselectAllObjects () {
	for ( var i = 0; i < selectedObjects.Count; i++ ) {
		DeselectObject ( selectedObjects[i] );
	}
}

// Deselect object
static function DeselectObject ( obj : GameObject ) {
	selectedObjects.Remove ( obj );
}

// Select object
static function SelectObject ( obj : GameObject ) {
	selectedObjects.Add ( obj );
			
	// Check what to display in the inspector
	inspector.ClearMenus ();
		
	// LightSource
	if ( obj.GetComponent(LightSource) ) {
		inspector.SetMenu ( 0, "Light", obj );
	} else {
		inspector.SetMenu ( 0, "Actor", obj );
		inspector.SetMenu ( 1, "Path", obj );
		inspector.SetMenu ( 2, "Trigger", obj );
	}

	inspector.SelectSubmenu ( "0" );
}


////////////////////
// Grab mode
////////////////////
// Set grab mode
static function SetGrabMode ( state : boolean ) {
	if ( selectedObjects.Count <= 0 ) {
		return;
	}
		
	grabMode = state;
	
	if ( grabMode ) {
		gizmo.SetActive ( true );
		gizmo.transform.parent = selectedObjects[selectedObjects.Count-1].transform;
		gizmo.transform.localPosition = Vector3.zero;
	} else {
		ToggleRestriction ( null );
		gizmo.SetActive ( false );
		gizmo.transform.parent = workspace;
		gizmo.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
	}
}

// Toggle grab mode
static function ToggleGrabMode () {
	SetGrabMode ( !grabMode );
}

// Toggle grab restriction
static function ToggleRestriction ( axis : String ) {
	grabRestrict = axis;
	
	for ( var i = 0; i < gizmo.transform.childCount; i++ ) {
		gizmo.transform.GetChild(i).gameObject.SetActive ( axis == null );
	}
	
	if ( axis ) {
		gizmo.transform.FindChild( axis ).gameObject.SetActive ( true );
	}
}


////////////////////
// File I/O
////////////////////
// Save file
static function SaveFile ( path : String ) {
	Saver.SaveMap ( path, EditorCore.currentLevel );
}

// Load file
static function LoadFile ( path : String ) {
	var parent = currentLevel.transform.parent;
	Destroy ( currentLevel );
	currentLevel = null;
	
	currentLevel = Loader.LoadMap ( path );
	
	currentLevel.transform.parent = parent;
	currentLevel.transform.localPosition = Vector3.zero;
}


////////////////////
// Set inspector instance
////////////////////
// Set inspector
static function SetInspector ( i : EditorMenuBase ) {
	inspector = i;
}


////////////////////
// Play/Exit
////////////////////
// Play level
static function PlayLevel () {
	Application.LoadLevel ( "game" );
}


////////////////////
// Init/Update
////////////////////
// Init
function Start () {
	workspace = _workspace;
	gizmo = _gizmo;
	cam = _camera;
	root = this.transform.parent;
	
	selectedMaterial = Resources.Load ( "Materials/Editor/editor_outline" );	
	previousMaterials = new List.< KeyValuePair.< GameObject, Material > > ();
	currentLevel = workspace.transform.GetChild(0).gameObject;
	gizmo.SetActive ( false );
}

// Update
function Update () {
	EditorInput.Update ();
}