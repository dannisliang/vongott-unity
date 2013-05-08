#pragma strict

import System.Collections.Generic;

// Private classes
private class Action {
	var object : GameObject;
	var position : Vector3;
	var rotation : Vector3;
	var scale : Vector3;
	
	function Action ( obj : GameObject ) {
		object = obj;
		position = obj.transform.localPosition;
		rotation = obj.transform.localEulerAngles;
		scale = obj.transform.localScale;
	}
	
	function UndoAction () {
		object.transform.localPosition = position;
		object.transform.localEulerAngles = rotation;
		object.transform.localScale = scale;
	}
}

// Public vars
var _workspace : Transform;
var _gizmo : GameObject;
var _camera : Transform;

// Static vars
static var menusActive = false;
static var selectedObject : GameObject;
static var currentLevel : GameObject;

// Load on init
static var initMap : String;
static var initPos : Vector3;
static var initRot : Vector3;

// modes
static var grabMode = false;
static var rotateMode = false;
static var scaleMode = false;
static var grabRestrict : String;

// editor essentials
static var workspace : Transform;
static var cam : Transform;
static var gizmo : GameObject;
static var inspector : EditorMenuBase;
static var player : GameObject;
static var camTarget : GameObject;
static var root : Transform;
static var drawPath : Vector3[];

// undo
static var actionStages : List.< Action > [] = new List.< Action > [10];
static var currentActionStage : int = 0;


////////////////////
// Undo buffer
////////////////////
function InitStages () {
/*	for ( var a : List.< Action > in actionStages ) {
		a = new List.< Action >();
	}*/
}

static function ClearStage ( stage : int ) {
//	actionStages[stage].Clear();
}

static function AddToStage ( stage : int, obj : GameObject ) {
//	actionStages[stage].Add ( new Action ( obj ) );
}

static function UndoStage ( stage : int ) {
	/*for ( var a : Action in actionStages[stage] ) {
		a.UndoAction();
	}*/
}

static function UndoCurrentStage () {
	//UndoStage ( currentActionStage );	
}


////////////////////
// Add
////////////////////
// Get spawn position
static function GetSpawnPosition () : Vector3 {
	var distance : float = 10.0;
	var forward = Camera.main.transform.TransformDirection ( Vector3.forward );
	var position = Camera.main.transform.position + forward * distance;
	
	return position;
}

// Add light
static function AddLight () {
	var newLight : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/light_source" ) as GameObject );
	newLight.transform.parent = currentLevel.transform;
	newLight.transform.position = GetSpawnPosition();
}

// Add actor
static function AddActor ( dir : String, name : String ) {
	var newActor : GameObject = Instantiate ( Resources.Load ( "Actors/" + dir + "/" + name ) as GameObject );
	newActor.transform.parent = currentLevel.transform;
	newActor.transform.position = GetSpawnPosition();
}

// Add item
static function AddItem ( dir : String, name : String ) {
	var newItem : GameObject = Instantiate ( Resources.Load ( "Items/" + dir + "/" + name ) as GameObject );
	newItem.transform.parent = currentLevel.transform;
	newItem.transform.position = GetSpawnPosition();
}


////////////////////
// Actor
////////////////////
// Equip item
static function EquipItem ( dir : String, name : String, slot : int ) {
	if ( selectedObject.GetComponent(Actor) ) {
		var obj : GameObject = Instantiate ( Resources.Load ( "Items/" + dir + "/" + name ) as GameObject );
		var item : Item = obj.GetComponent(Item);
		
		selectedObject.GetComponent(Actor).inventory[slot] = InventoryManager.ConvertItemToEntry ( item );
		
		DestroyImmediate ( obj );
	}
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
// Reselect object
static function ReselectObject () {
	SelectObject ( selectedObject );
}

// Get selected objects
static function GetSelectedObject () : GameObject {
	return selectedObject;
}

// Delete selected objects
static function DeleteSelected () {
	Destroy ( selectedObject );
	DeselectObject ();
}

// Is object selected?
static function IsObjectSelected ( obj : GameObject ) : boolean {
	return ( selectedObject == obj );
}

// Duplicate object
static function DuplicateObject () {
	var newObj : GameObject = Instantiate ( selectedObject );
	newObj.transform.parent = currentLevel.transform;
}

// Deselect object
static function DeselectObject () {	
	if ( selectedObject.GetComponent(Actor) ) {
		for ( var node : GameObject in selectedObject.GetComponent(Actor).path ) {
			node.GetComponent(MeshRenderer).enabled = false;
		}
	}
	
	drawPath = null;
	selectedObject = null;
}

// Select object
static function SelectObject ( obj : GameObject ) {
	if ( selectedObject ) { 
		DeselectObject ();
	}
	
	drawPath = null;
	selectedObject = obj;
							
	// Check what to display in the inspector
	inspector.ClearMenus ();
	
	// LightSource
	if ( obj.GetComponent(LightSource) ) {
		inspector.SetMenu ( 0, "Light", obj );
	
	// Actor
	} else if ( obj.GetComponent(Actor) ) {
		inspector.SetMenu ( 0, "Actor", obj );
		inspector.SetMenu ( 1, "Trigger", obj );
		
		for ( var node : GameObject in obj.GetComponent(Actor).path ) {
			node.GetComponent(MeshRenderer).enabled = true;
		}
	
	// Item
	} else if ( obj.GetComponent(Item) ) {
		inspector.SetMenu ( 0, "Item", obj );
		inspector.SetMenu ( 1, "Trigger", obj );
	
	}

	inspector.SelectSubmenu ( "0" );
}


////////////////////
// Modes
////////////////////
// Set grab mode
static function SetGrabMode ( state : boolean ) {
	if ( !selectedObject ) {
		return;
	}
		
	grabMode = state;
	
	if ( grabMode ) {
		currentActionStage++;
		AddToStage ( currentActionStage, selectedObject );
		
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Grab Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse scroll wheel to move\nHold Shift or Ctrl to change speed" );
		EditorModes.SetHeight ( 90 );
		
		gizmo.SetActive ( true );
		gizmo.transform.parent = selectedObject.transform;
		gizmo.transform.localPosition = Vector3.zero;
	
	} else {
		OGRoot.GoToPage ( "MenuBase" );
		
		SetRestriction ( null );
		gizmo.SetActive ( false );
		gizmo.transform.parent = workspace;
		gizmo.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
		
		if ( selectedObject.GetComponent(PathNode) ) {
			SelectObject ( selectedObject.GetComponent(PathNode).owner );
		}
	}
}

// Set rotate mode
static function SetRotateMode ( state : boolean ) {
	if ( !selectedObject ) {
		return;
	}
		
	rotateMode = state;
	
	if ( rotateMode ) {
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Rotate Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse scroll wheel to rotate\nHold Shift or Ctrl to change speed" );
		EditorModes.SetHeight ( 90 );
		
		gizmo.SetActive ( true );
		gizmo.transform.parent = selectedObject.transform;
		gizmo.transform.localPosition = Vector3.zero;
	
	} else {
		OGRoot.GoToPage ( "MenuBase" );
		
		SetRestriction ( null );
		gizmo.SetActive ( false );
		gizmo.transform.parent = workspace;
		gizmo.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
		
		if ( selectedObject.GetComponent(PathNode) ) {
			SelectObject ( selectedObject.GetComponent(PathNode).owner );
		}
	}
}

// Set scale mode
static function SetScaleMode ( state : boolean ) {
	if ( !selectedObject ) {
		return;
	}
		
	scaleMode = state;
	
	if ( scaleMode ) {
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Scale Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse scroll wheel to scale\nHold Shift or Ctrl to change speed" );
		EditorModes.SetHeight ( 90 );
		
		gizmo.SetActive ( true );
		gizmo.transform.parent = selectedObject.transform;
		gizmo.transform.localPosition = Vector3.zero;
	
	} else {
		OGRoot.GoToPage ( "MenuBase" );
		
		SetRestriction ( null );
		gizmo.SetActive ( false );
		gizmo.transform.parent = workspace;
		gizmo.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
	}
}

// Toggle grab restriction
static function SetRestriction ( axis : String ) {
	grabRestrict = axis;
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

// Load conversations from library
static function GetConvoChapters () : String[] {
	return Directory.GetDirectories ( Application.dataPath + "/Conversations", "*" );;
}

static function GetConvoScenes ( chapter : int ) : String[] {
	return Directory.GetDirectories ( Application.dataPath + "/Conversations/" + chapter.ToString(), "*" );;
}

static function GetConvos ( chapter : int, scene: int ) : String[] {
	return Directory.GetFiles ( Application.dataPath + "/Conversations/" + chapter.ToString() + "/" + scene.ToString(), "*" );;
}


////////////////////
// Set inspector instance
////////////////////
// Set inspector
static function SetInspector ( i : EditorMenuBase ) {
	inspector = i;
}


////////////////////
// Play
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

	currentLevel = workspace.transform.GetChild(0).gameObject;
	gizmo.SetActive ( false );

	InitStages();
	
	if ( initMap ) {
		LoadFile ( initMap );
	}
	
	if ( initPos != null ) {
		Camera.main.transform.position = initPos;
	}
	
	if ( initRot != null ) {
		Camera.main.transform.eulerAngles = initRot;
	}
	
	// signal
	GameCore.Print ("EditorCore | started");
}

// Update
function Update () {
	EditorInput.Update ();
}