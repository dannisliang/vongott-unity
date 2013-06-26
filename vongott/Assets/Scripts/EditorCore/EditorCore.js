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
	var obj : GameObject;
	var objPath : String;
	var position : Vector3;
	var rotation : Vector3;
	var scale : Vector3;
	var type : String;
	
	function Action ( o : GameObject, t : String ) {
		obj = o;
		position = o.transform.localPosition;
		rotation = o.transform.localEulerAngles;
		scale = o.transform.localScale;
		type = t;
		
		if ( o.GetComponent ( Prefab ) ) {
			objPath = "Prefabs/" + o.GetComponent ( Prefab ).path + "/" + o.GetComponent ( Prefab ).id;
		}
	}
	
	function UndoAction () {
		if ( !obj ) { return; }
		
		if ( type == "transform" ) {
			obj.transform.localPosition = position;
			obj.transform.localEulerAngles = rotation;
			obj.transform.localScale = scale;
		
		}
	}
}

// Public vars
var _workspace : Transform;
var _gizmo : GameObject;
var _previewCamera : Camera;

// Static vars
static var menusActive = false;
static var selectedObject : GameObject;
static var selectedPlane : SurfacePlane;
static var selectedVertex : int;
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
static var editMeshMode = false;

// grid / guides
static var gizmo : GameObject;
static var snapEnabled = true;
static var gridEnabled = false;
static var focusEnabled = false;
static var gridLineDistance : float = 1.0;
static var gridLineBrightFrequency : int = 5;

// editor essentials
static var workspace : Transform;
static var cam : Transform;
static var inspector : EditorMenuBase;
static var player : GameObject;
static var camTarget : GameObject;
static var root : Transform;
static var drawPath : Vector3[];
static var origColors : List.< KeyValuePair.< Material, Color > > = new List.< KeyValuePair.< Material, Color > > ();
static var noGizmos : boolean = false;
static var previewObject : GameObject;
static var previewCamera : Camera;
static var transformUpdate : Function;
static var transformEnd : Function;
static var grabDistance : float;
static var grabOrigPoint : Vector3;

// undo
static var actions : List.< Action > = new List.< Action > ();
static var currentAction : Action;


////////////////////
// Undo buffer
////////////////////
static function UndoAction ( action : Action ) {
	// Check for lost object
	if ( action.obj == null ) {
		for ( var a : Action in actions ) {
			if ( a.objPath == action.objPath ) {
				action.obj = a.obj;
			}
		}
	}
	
	if ( action.type != "delete" ) {
		action.UndoAction ();
	} else {
		
		var newObj : GameObject = Instantiate ( Resources.Load ( action.objPath ) ) as GameObject;
		newObj.transform.parent = currentLevel.transform;
		newObj.transform.localPosition = action.position;
		newObj.transform.localEulerAngles = action.rotation;
		newObj.transform.localScale = action.scale;
		
		action.obj = newObj;
	}
	
	actions.Remove ( action );
	
	if ( actions.Count > 0 ) {
		currentAction = actions[actions.Count-1];
	} else {
		currentAction = null;
	}
}

static function AddAction ( obj : GameObject, type : String ) {
	var newAction : Action = new Action ( obj, type );
	
	actions.Add ( newAction );
	
	if ( actions.Count > 10 ) {
		actions.RemoveAt ( 0 );
	}
	
	currentAction = newAction;
}

static function UndoCurrentAction () {
	if ( currentAction != null ) {
		UndoAction ( currentAction );
	};	
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

// Add spawnpoint
static function AddSpawnPoint () {
	for ( var spawnPoint : SpawnPoint in currentLevel.GetComponentsInChildren ( SpawnPoint ) ) {
		Destroy ( spawnPoint.gameObject );
	}
	
	var newLight : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/spawnpoint" ) as GameObject );
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
static function AddObject ( obj : GameObject ) {
	var newObject : GameObject = Instantiate ( obj );
	newObject.transform.parent = currentLevel.transform;
	newObject.transform.position = GetSpawnPosition();
}

// Preview any object
static function ClearPreview () {
	if ( previewObject ) {
		Destroy ( previewObject );
	}
}

static function SetLayerRecursively ( obj : GameObject, lay : int ) {
	if ( obj == null ) { return; }
	
	obj.layer = lay;
	
	for ( var child : Transform in obj.transform ) {
        if ( child == null ) {
        	continue;
        }

        SetLayerRecursively ( child.gameObject, lay );
    }
}

static function PreviewObject ( obj : GameObject ) : ObjectAttributes {
	ClearPreview ();
	
	previewObject = Instantiate ( obj );
	
	var scal = previewCamera.WorldToScreenPoint ( previewObject.transform.position ).z;
	previewObject.transform.localPosition = new Vector3 ( 0, 0, 5 );
	previewObject.transform.localScale = Vector3.one;
	previewObject.transform.localEulerAngles = new Vector3 ( 0, 225, 0 );
	
	SetLayerRecursively ( previewObject, 8 );

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
// Create
////////////////////
// Create surface
static function CreateSurface () {   
    var newObject : GameObject = new GameObject("Surface", MeshRenderer, MeshFilter, MeshCollider, Surface );
        
	newObject.transform.position = GetSpawnPosition();
	newObject.transform.parent = currentLevel.transform;
	
	//SelectObject ( newObject );
}


////////////////////
// Actor
////////////////////
// Equip item
static function EquipItem ( obj : GameObject, slot : int ) {
	if ( selectedObject.GetComponent(Actor) ) {
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


////////////////////
// Select objects
////////////////////
// Pin materials
static function PinColor ( mat : Material ) {
	origColors.Add ( new KeyValuePair. < Material, Color > ( mat, mat.color ) );
}

// Unpin materials
static function UnpinColor ( mat : Material ) : Color {
	var color : Color;
	
	for ( var kvp : KeyValuePair. < Material, Color > in origColors ) {
		if ( kvp.Key == mat ) {
			color = kvp.Value;
			origColors.Remove ( kvp );
			break;
		}
	}
	
	return color;
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
	var obj : GameObject = selectedObject;
	AddAction ( obj, "delete" );
	DeselectObject ();
	Destroy ( obj );	
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
	var selectNextObject : GameObject;
	
	if ( selectedObject.GetComponent(Actor) ) {
		for ( var node : GameObject in selectedObject.GetComponent(Actor).path ) {
			node.GetComponent(MeshRenderer).enabled = false;
		}
	
	} else if ( selectedObject.GetComponent ( EditorVertexGizmo ) ) {
		selectNextObject = selectedObject.GetComponent ( EditorVertexGizmo ).surface.gameObject;
		transformUpdate = null;
		
	}
	
	focusEnabled = false;
	
	var renderer : MeshRenderer = selectedObject.GetComponent ( MeshRenderer );
	
	if ( renderer ) {
		for ( var mat : Material in renderer.materials ) {
		 	mat.color = UnpinColor ( mat );
		}
	}
	
	drawPath = null;
	selectedObject = null;
	
	inspector.ClearMenus ();
	
	if ( selectNextObject ) {
		SelectObject ( selectNextObject );
	}
}

// Select vertex
static function SelectVertex ( surface : Surface, plane : SurfacePlane, vertex : int, gizmo : Transform ) {
	SetGrabMode ( true );
	
	transformUpdate = function () {
		plane.vertices[vertex] = gizmo.position - surface.transform.position;
		surface.Apply ();
	};

	transformEnd = function () {
		plane.vertices[vertex] = gizmo.position - surface.transform.position;
		surface.Apply ();
		
		SelectObject ( surface.gameObject );
		
		surface.CreateButtons ();
	};
}

// Select object
static function SelectObject ( obj : GameObject ) {
	if ( !obj || obj.GetComponent ( OGButton3D ) ) {
		return;
	} else if ( obj.GetComponent ( EditorVertexGizmo ) ) {
		var gizmo : EditorVertexGizmo = obj.GetComponent ( EditorVertexGizmo );
		
		SelectVertex ( gizmo.surface, gizmo.plane, gizmo.vertex, gizmo.transform );
	}
				
	if ( selectedObject ) { 
		DeselectObject ();
	}
	
	drawPath = null;
	selectedObject = obj;
	
	grabDistance = Vector3.Distance ( Camera.main.transform.position, selectedObject.transform.position );
	grabOrigPoint = selectedObject.transform.position;
																			
	// Check what to display in the inspector
	inspector.ClearMenus ();
	
	// Change material
	var renderer : MeshRenderer = selectedObject.GetComponent ( MeshRenderer );
	
	if ( renderer ) {
		for ( var i = 0; i < renderer.materials.Length; i++ ) {
			PinColor ( renderer.materials[i] );
			renderer.materials[i].color = Color.green;
		}
	}
	
	// LightSource
	if ( obj.GetComponent(LightSource) ) {
		inspector.AddMenu ( "Light", obj );
	
	// Actor
	} else if ( obj.GetComponent(Actor) ) {
		inspector.AddMenu ( "Actor", obj );
		inspector.AddMenu ( "Path", obj );
		
		for ( var node : GameObject in obj.GetComponent(Actor).path ) {
			node.GetComponent(MeshRenderer).enabled = true;
		}
	
	// Item
	} else if ( obj.GetComponent(Item) ) {
		inspector.AddMenu ( "Item", obj );
		inspector.AddMenu ( "Trigger", obj );
	
	// Prefab
	} else if ( obj.GetComponent ( Prefab ) ) {
		inspector.AddMenu ( "Prefab", obj );
	
	// Plane
	} else if ( obj.GetComponent ( Surface ) ) {
		inspector.AddMenu ( "Surface", obj );
	
	}
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
		AddAction ( selectedObject, "transform" );
		
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Grab Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse mouse to move" );
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
		AddAction ( selectedObject, "transform" );
		
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Rotate Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse scroll wheel to rotate\nHold Shift or Ctrl to change speed" );
		EditorModes.SetHeight ( 110 );
		
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

// Edit mesh mode
static function ToggleEditMeshMode () {
	editMeshMode = !editMeshMode;
}

// Set scale mode
static function SetScaleMode ( state : boolean ) {
	if ( !selectedObject ) {
		return;
	}
		
	scaleMode = state;
	
	if ( scaleMode ) {
		AddAction ( selectedObject, "transform" );
		
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Scale Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse scroll wheel to scale\nHold Shift or Ctrl to change speed" );
		EditorModes.SetHeight ( 110 );
		
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
// Trim filename
static function TrimFileNames ( paths : String[] ) : String[] {
	var newArray : String[] = new String[paths.Length];
	
	for ( var i = 0; i < paths.Length; i++ ) {
		var path = paths[i].Split("\\"[0]);
		var fileName = path[path.Length-1];
		var extention = fileName.Split("."[0]);
		var name = extention[0];
		newArray[i] = name;
	}
	
	return newArray;
}

// Screenshot
static function LoadScreenshot ( path ) : Texture2D {
	return Loader.LoadScreenshot ( path );
}

// Save file
static function SaveFile ( path : String ) {
	//yield new WaitForEndOfFrame();
	
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
	return TrimFileNames ( Directory.GetDirectories ( Application.dataPath + "/Story/Conversations", "*" ) );
}

static function GetConvoScenes ( chapter : String ) : String[] {
	return TrimFileNames ( Directory.GetDirectories ( Application.dataPath + "/Story/Conversations/" + chapter, "*" ) );
}

static function GetConvoNames ( chapter : String, scene: String ) : String[] {
	return TrimFileNames ( Directory.GetDirectories ( Application.dataPath + "/Story/Conversations/" + chapter + "/" + scene, "*" ) );
}

static function GetConvos ( chapter : String, scene: String, name: String ) : String[] {
	return TrimFileNames ( Directory.GetFiles ( Application.dataPath + "/Story/Conversations/" + chapter + "/" + scene + "/" + name, "*" ) );
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
	root = this.transform.parent;

	currentLevel = workspace.transform.GetChild(0).gameObject;
	
	gizmo.SetActive ( false );

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
	if ( transformUpdate ) {
		transformUpdate ();
	}
}