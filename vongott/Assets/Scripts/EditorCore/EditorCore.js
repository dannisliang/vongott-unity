#pragma strict

import System.Collections.Generic;
import System.IO;

// Public classes
public class ObjectAttributes {
	var keys : String = "";
	var values : String = "";
}

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
var _previewCamera : Camera;
var _selectedShader : Shader;

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
static var snap : Vector3 = Vector3.zero;
static var snapEnabled = true;
static var selectedShader : Shader;
static var origShaders : List.< KeyValuePair.< Material, Shader > > = new List.< KeyValuePair.< Material, Shader > > ();
static var noGizmos : boolean = false;
static var previewObject : GameObject;
static var previewCamera : Camera;

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

// Add prefab
static function AddPrefab ( dir : String, name : String ) {
	var newPrefab : GameObject = Instantiate ( Resources.Load ( "Prefabs/" + dir + "/" + name ) as GameObject );
	newPrefab.transform.parent = currentLevel.transform;
	newPrefab.transform.position = GetSpawnPosition();
}

// Add any object
static function AddObject ( root : String, dir : String, name : String ) {
	var newObject : GameObject = Instantiate ( Resources.Load ( root + "/" + dir + "/" + name ) as GameObject );
	newObject.transform.parent = currentLevel.transform;
	newObject.transform.position = GetSpawnPosition();
}

// Preview any object
static function ClearPreview () {
	if ( previewObject ) {
		Destroy ( previewObject );
	}
}

static function PreviewObject ( path ) : ObjectAttributes {
	ClearPreview ();
	
	Debug.Log ( path );
	
	previewObject = Instantiate ( Resources.Load ( path ) as GameObject );
	
	previewObject.transform.localPosition = new Vector3 ( 0, 0, 5 );
	
	var scal = previewCamera.WorldToScreenPoint ( previewObject.transform.position ).z;
	previewObject.transform.localScale = 0.25 * Vector3 ( scal, scal, scal );
	
	previewObject.transform.localEulerAngles = new Vector3 ( -45, 45, 0 );
	previewObject.layer = 8;

	// attributes
	var attributes : ObjectAttributes = new ObjectAttributes();

	// ^ equipment
	if ( previewObject.GetComponent ( Item ) ) {
		var itm : Item = previewObject.GetComponent ( Item );
		
		attributes.keys = itm.title + "\n\n";
		attributes.values = "\n\n";
		
		for ( var attr : Item.Attribute in itm.attr ) {
			attributes.keys += attr.type.ToString() + "\n";
			attributes.values += attr.val.ToString() + "\n";
		}
	}
	
	return attributes;
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

// Unequip item
static function UnequipItem ( slot : int ) {
	if ( selectedObject.GetComponent(Actor) ) {
		selectedObject.GetComponent(Actor).inventory[slot] = null;
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

// Toggle gizmos
static function ToggleGizmos () {
	noGizmos = !noGizmos;
}

// Set grid
static function SetSnap ( vector : Vector3 ) {
	snap = vector;
}


////////////////////
// Select objects
////////////////////
// Pin materials
static function PinShader ( mat : Material, shader : Shader ) {
	origShaders.Add ( new KeyValuePair. < Material, Shader > ( mat, shader ) );
}

// Unpin materials
static function UnpinShader ( obj : Material ) : Shader {
	var shader : Shader;
	
	for ( var kvp : KeyValuePair. < Material, Shader > in origShaders ) {
		if ( kvp.Key == obj ) {
			shader = kvp.Value;
			origShaders.Remove ( kvp );
			break;
		}
	}
	
	return shader;
}

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

	DeselectObject ();
	SelectObject ( newObj );
}

// Deselect object
static function DeselectObject () {	
	if ( selectedObject.GetComponent(Actor) ) {
		for ( var node : GameObject in selectedObject.GetComponent(Actor).path ) {
			node.GetComponent(MeshRenderer).enabled = false;
		}
	}
	
	var renderer : MeshRenderer = selectedObject.GetComponent ( MeshRenderer );
	
	for ( var mat : Material in renderer.materials ) {
	 	var origShader : Shader = UnpinShader ( mat );
	
		if ( origShader ) {
			mat.shader = origShader;
		}
	}
	
	drawPath = null;
	selectedObject = null;
}

// Select object
static function SelectObject ( obj : GameObject ) {
	if ( !obj ) {
		return;
	}
	
	if ( selectedObject ) { 
		DeselectObject ();
	}
	
	drawPath = null;
	selectedObject = obj;
							
	// Check what to display in the inspector
	inspector.ClearMenus ();
	
	// Change material
	var renderer : MeshRenderer = selectedObject.GetComponent ( MeshRenderer );
	var newMaterials : Material[] = new Material[renderer.materials.Length];
		
	for ( var i = 0; i < newMaterials.Length; i++ ) {
		PinShader ( renderer.materials[i], renderer.materials[i].shader );
		newMaterials[i] = renderer.materials[i];
		newMaterials[i].shader = selectedShader;
		newMaterials[i].SetColor ( "_OutlineColor", Color.cyan );
		newMaterials[i].SetFloat ( "_Outline", 0.0025 );
	}
	
	renderer.materials = newMaterials;
	
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
// Screenshot
static function LoadScreenshot ( path ) : Texture2D {
	return Loader.LoadScreenshot ( path );
}

// Save file
static function SaveFile ( path : String ) {
	yield new WaitForEndOfFrame();
	
	var tex : Texture2D = new Texture2D(Screen.width, Screen.height);	
	tex.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);
	TextureScale.Bilinear ( tex, tex.width * 0.25, tex.height * 0.25 );	
	
	Saver.SaveMap ( path, EditorCore.currentLevel, tex );
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
	return Directory.GetDirectories ( Application.dataPath + "/Conversations", "*" );
}

static function GetConvoScenes ( chapter : String ) : String[] {
	return Directory.GetDirectories ( Application.dataPath + "/Conversations/" + chapter, "*" );
}

static function GetConvoNames ( chapter : String, scene: String ) : String[] {
	return Directory.GetDirectories ( Application.dataPath + "/Conversations/" + chapter + "/" + scene, "*" );
}

static function GetConvos ( chapter : String, scene: String, name: String ) : String[] {
	return Directory.GetFiles ( Application.dataPath + "/Conversations/" + chapter + "/" + scene + "/" + name, "*" );
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
	UILoading.loadScene = "game";
	Application.LoadLevel ( "loading" );
}


////////////////////
// Init/Update
////////////////////
// Init
function Start () {
	workspace = _workspace;
	gizmo = _gizmo;
	previewCamera = _previewCamera;
	selectedShader = _selectedShader;
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