#pragma strict

import System.Collections.Generic;
import System.IO;

// Public vars
public var _workspace : Transform;
public var _gizmo : GameObject;
public var _previewCamera : Camera;
public var _selectBox : Transform;
public var _selectBoxDefaultMesh : Mesh;
public var _undoContainer : Transform;
public var _defaultMaterial : Material;
public var _navMeshMaterial : Material;

// Static vars
static var menusActive : boolean = false;
static var selectedObject : GameObject;
static var selectedPlane : SurfacePlane;
static var selectedVertex : int;
static var currentLevel : GameObject;
static var navNodes : OPNode[];

// Load on init
static var initMap : String;
static var initPos : Vector3 = new Vector3 ( -4, 5,-10 );
static var initRot : Vector3 = new Vector3 ( 24.9, 21.8, 0 );

// modes
static var firstPersonMode : boolean = false;
static var grabMode : boolean = false;
static var rotateMode : boolean = false;
static var scaleMode : boolean = false;
static var pickMode : boolean = false;
static var pickerCallback : Function = null;
static var pickerSender : String = "";
static var pickerType : System.Type;
static var grabRestrict : String;

// grid / guides
static var gizmo : GameObject;
static var snapEnabled : boolean = true;
static var gridEnabled : boolean = true;
static var gridLineDistance : float = 0.10;
static var gridLineBrightFrequency : int = 5;

// editor essentials
static var instance : EditorCore;
static var selectBox : Transform;
static var selectBoxDefaultMesh : Mesh;
static var workspace : Transform;
static var cam : Transform;
static var inspector : EditorMenuBase;
static var player : GameObject;
static var camTarget : GameObject;
static var root : Transform;
static var noGizmos : boolean = false;
static var previewObject : GameObject;
static var previewCamera : Camera;
static var transformUpdate : Function;
static var transformEnd : Function;
static var grabDistance : float;
static var grabOrigPoint : Vector3;
static var running : boolean = false;
static var stringClipboard : String = "";
static var defaultMaterial : Material;
static var navMeshMaterial : Material;

// undo
static var actions : List.< Action > = new List.< Action >();
static var currentAction : Action;
static var undoContainer : Transform;

// Public classes
public class ObjectAttributes {
	var keys : String = "";
	var values : String = "";
}

public class Action {
	var originalObject : GameObject;
	var storedObject : GameObject;
	var storedPosition : Vector3;
	var storedRotation : Vector3;
	var storedScale : Vector3;
	
	function Action ( o : GameObject ) {
		originalObject = o;
		storedObject = MonoBehaviour.Instantiate ( originalObject );
		storedObject.name = storedObject.name.Replace("(Clone)","");
		
		storedPosition = originalObject.transform.position;
		storedRotation = originalObject.transform.localEulerAngles;
		storedScale = originalObject.transform.localScale;		
	}
}


////////////////////
// Undo buffer
////////////////////
static function UndoAction ( action : Action ) {
	action.storedObject.transform.parent = currentLevel.transform;
	action.storedObject.transform.position = action.storedPosition;
	action.storedObject.transform.localEulerAngles = action.storedRotation;
	action.storedObject.transform.localScale = action.storedScale;
	action.storedObject.SetActive ( true );
	
	if ( action.originalObject ) {
		if ( action.originalObject == selectedObject ) {
			SelectObject ( action.storedObject );
			FitSelectionBox ();
		}
		
		Destroy ( action.originalObject );
	}
	
	actions.Remove ( action );
	
	if ( actions.Count > 0 ) {
		currentAction = actions[actions.Count-1];
	} else {
		currentAction = null;
	}
}

static function AddAction ( obj : GameObject ) {
	var newAction : Action = new Action ( obj );
	
	newAction.storedObject.transform.parent = undoContainer;
	newAction.storedObject.transform.localPosition = Vector3.zero;
	newAction.storedObject.SetActive ( false );
	
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
	return Camera.main.GetComponent ( EditorCamera ).cursor.position;
}

// Add light
static function AddLight () {
	var newLight : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/light_source" ) as GameObject );
	newLight.transform.parent = currentLevel.transform;
	newLight.transform.position = GetSpawnPosition();
	
	SelectObject ( newLight );
}

// Add spawnpoint
static function AddSpawnPoint () {
	var newSpawnPoint : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/spawnpoint" ) as GameObject );
	newSpawnPoint.transform.parent = currentLevel.transform;
	newSpawnPoint.transform.position = GetSpawnPosition();
	
	SelectObject ( newSpawnPoint );
}

// Add trigger
static function AddTrigger () {
	var newTrigger : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/trigger" ) as GameObject );
	newTrigger.transform.parent = currentLevel.transform;
	newTrigger.transform.position = GetSpawnPosition();
	
	SelectObject ( newTrigger );
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
	
	newObject.name = newObject.name.Replace( "(Clone)", "" );
	
	// Check if skybox
	if ( newObject.GetComponent ( SkyBox ) ) {
		var parent : Transform = GameObject.FindWithTag("SkyboxCamera").transform.parent;
		
		if ( parent.gameObject.GetComponentInChildren ( SkyBox ) ) {
			Destroy ( parent.gameObject.GetComponentInChildren ( SkyBox ).gameObject );
		}
		
		newObject.transform.parent = parent;
		newObject.transform.localScale = Vector3.one;
		newObject.transform.localEulerAngles = Vector3.zero;
		newObject.transform.localPosition = Vector3.zero;
	
	} else {
		// Check for shapes
		if ( newObject.GetComponent ( Shape ) ) {
			for ( var s : Component in workspace.GetComponentsInChildren(Shape) ) {
				Destroy ( (s as Shape).gameObject );
			}
		}
		
		newObject.transform.parent = currentLevel.transform;
		newObject.transform.position = GetSpawnPosition();
		
		SelectObject ( newObject );
	
	}
}

// Replace the currently selected object
static function ReplaceSelectedObject ( obj : GameObject ) {
	if ( selectedObject != null ) {
		var newObject : GameObject = Instantiate ( obj );
		newObject.transform.parent = currentLevel.transform;
		newObject.transform.position = selectedObject.transform.position;
		newObject.transform.localEulerAngles = selectedObject.transform.localEulerAngles;
		newObject.transform.localScale = selectedObject.transform.localScale;
	
		newObject.name = newObject.name.Replace( "(Clone)", "" );
	
		if ( newObject.GetComponent ( Prefab ) && selectedObject.GetComponent ( Prefab ) ) {
			if ( newObject.GetComponent ( Prefab ).canChangeMaterial && selectedObject.GetComponent ( Prefab ).canChangeMaterial ) {
		  		if ( !String.IsNullOrEmpty ( selectedObject.GetComponent ( Prefab ).materialPath ) ) {
					newObject.GetComponent ( Prefab ).materialPath = selectedObject.GetComponent ( Prefab ).materialPath;
					newObject.GetComponent ( Prefab ).ReloadMaterial ();
				}
			}
		}
	
		Destroy ( selectedObject );
		
		SelectObject ( newObject );
			
	} else {
		AddObject ( obj );
	}
}

// Preview any object
static function ClearPreview () {
	if ( previewObject ) {
		DestroyImmediate ( previewObject );
	}
}

static function SetLayerRecursively ( obj : GameObject, lay : int ) {
	if ( obj == null ) { return; }
	
	obj.layer = lay;
	
	for ( var i = 0; i < obj.transform.childCount; i++ ) {
        if ( obj.transform.GetChild(i) == null ) {
        	continue;
        }

        SetLayerRecursively ( obj.transform.GetChild(i).gameObject, lay );
    }
}

static function PreviewObject ( obj : GameObject ) : ObjectAttributes {
	// attributes
	var attributes : ObjectAttributes = new ObjectAttributes();

	// ^ equipment
	if ( obj.GetComponent ( Item ) ) {
		var itm : Item = obj.GetComponent ( Item );
		
		attributes.keys = itm.title + "\n\n";
		attributes.values = "\n\n";
		
		for ( var attr : Item.Attribute in itm.attr ) {
			attributes.keys += attr.type.ToString() + "\n";
			attributes.values += attr.val.ToString() + "\n";
		}
	}
	
	return attributes;
}

static function GetObjectIcon ( obj : GameObject, image : OGImage ) : IEnumerator {
	ClearPreview ();
	
	yield new WaitForEndOfFrame();
	
	previewObject = Instantiate ( obj );

	previewObject.transform.position = Vector3.zero;
	previewObject.transform.localScale = Vector3.one;
	previewObject.transform.localEulerAngles = new Vector3 ( 0, 135, 0 );
	
	var bounds : Bounds;
	
	if ( previewObject.GetComponentInChildren(MeshRenderer) ) {
		bounds = previewObject.GetComponentInChildren(MeshRenderer).bounds;
	} else {
		bounds = previewObject.GetComponentInChildren(SkinnedMeshRenderer).bounds;
	}
	
	var center : Vector3 = bounds.center;
	
	previewCamera.transform.parent.position = new Vector3 ( center.x, 0, -5 );
	previewCamera.transform.LookAt ( center );
	
	/*var scal : float = previewCamera.WorldToScreenPoint ( previewObject.transform.position ).z;
	previewObject.transform.localScale = new Vector3 ( scal, scal, scal );*/
	
	SetLayerRecursively ( previewObject, 8 );

	var tex : Texture2D = new Texture2D ( 128, 128 );
	tex.name = "thumb_" + obj.name;
	
	var rt : RenderTexture = new RenderTexture ( 128, 128, 24 );
	previewCamera.targetTexture = rt;
	previewCamera.Render();
	RenderTexture.active = rt;
	 
	previewCamera.Render();
		   
	// Read pixels
	tex.ReadPixels(new Rect ( 0, 0, 128, 128 ), 0, 0);
	tex.Apply ();
	  
	// Clean up
	previewCamera.targetTexture = null;
	RenderTexture.active = null; // added to avoid errors
	DestroyImmediate(rt);
	
	ClearPreview ();
	
	image.image = tex;
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
// Shape
////////////////////
// Solidify
public function AddShape ( shape : Shape, method : BooleanRTLib.BooleanType ) {
	Debug.Log ( "EditorCore | Adding shape " + shape );
	
	var combinedMesh : CombinedMesh = workspace.gameObject.FindObjectOfType ( CombinedMesh );
	
	if ( !combinedMesh ) {
		combinedMesh = Instantiate ( Resources.Load ( "Prefabs/Editor/CombinedMesh" ) as GameObject ).GetComponent ( CombinedMesh );
		combinedMesh.gameObject.name = "CombinedMesh";
		combinedMesh.transform.parent = currentLevel.transform;
		combinedMesh.transform.localPosition = Vector3.zero;
		combinedMesh.transform.localEulerAngles = Vector3.zero;
		combinedMesh.transform.localScale = Vector3.one;
	}
	
	AddAction ( combinedMesh.gameObject );
	
	combinedMesh.Add ( shape.gameObject, defaultMaterial, method );
	
}


////////////////////
// Path finding
////////////////////
// Get all
public static function GetWayPoints () : OPWayPoint[] {
	return GameObject.FindObjectsOfType(OPWayPoint);
}

// Update all
public static function UpdateWayPoints () {
	var allNodes : OPWayPoint[] = GetWayPoints ();

	for ( var nnc : OPWayPoint in allNodes ) {
		nnc.FindNeighbors ( allNodes );
	}
}

// Add nav node
static function AddWayPoint () {
	var newNode : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/waypoint" ) as GameObject );
	newNode.transform.parent = currentLevel.transform;
	newNode.transform.position = GetSpawnPosition();
	newNode.name = newNode.name.Replace("(Clone)","");
	
	SelectObject ( newNode );
}

// Add nav mesh
static function AddNavMesh () {
	EditorOpenFile.baseDir = "ImportOBJ";
	EditorOpenFile.fileType = "obj";
	EditorOpenFile.asNavMesh = true;
	OGRoot.GoToPage ( "OpenFile" );
}

// Bake
private function ScanForNodes () : IEnumerator {
	var scanner : OPScanner = this.GetComponent(OPScanner);
	
	EditorLoading.message = "Baking navigation nodes...";
	OGRoot.GoToPage ( "Loading" );
	
	yield WaitForEndOfFrame();
	
	yield scanner.Init ();
	
	yield WaitForEndOfFrame();
	
	if ( scanner.map == null ) {
		Debug.LogError ( "EditorCore | No map found in scanner!" );
	
	} else {
		navNodes = scanner.map.nodes;
	
	}
	
	OGRoot.GoToPage ( "MenuBase" );
}

public function BakeNavNodes () {
	StartCoroutine ( ScanForNodes () );
}


////////////////////
// Actor
////////////////////
// Get actor form GUID
static function GetActor ( guid : String ) : Actor {
	for ( var a : Component in workspace.GetComponentsInChildren(Actor) ) {
		if ( a.GetComponent(GUID).GUID == guid ) {
			return a as Actor;
		}
	}
	
	return null;
}

// Get prefab form GUID
static function GetPrefab ( guid : String ) : Prefab {
	for ( var p : Component in workspace.GetComponentsInChildren(Prefab) ) {
		if ( p.GetComponent(GUID).GUID == guid ) {
			return p as Prefab;
		}
	}
	
	return null;
}

// Equip item
static function EquipItem ( obj : GameObject, slot : int ) {
	if ( selectedObject.GetComponent(Actor) ) {
		var item : Item = obj.GetComponent(Item);
		
		selectedObject.GetComponent(Actor).inventory[slot] = new InventoryEntry ( item );
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

// Toggle navigation
static function ToggleNavigation () {
	var navMesh : OPNavMesh = GameObject.FindObjectOfType ( OPNavMesh );
	if ( navMesh != null ) {
		navMesh.GetComponent ( MeshRenderer ).enabled = !navMesh.GetComponent ( MeshRenderer ).enabled;
	}
}


////////////////////
// Select objects
////////////////////
// Find object from GUID
public static function GetObjectFromGUID ( id : String ) : GameObject {
	for ( var c : Component in workspace.GetComponentsInChildren(GUID) ) {
		if ( (c as GUID).GUID == id ) {
			return c.gameObject;
		}
	}
	
	return null;
}

// Fit selection box
static function FitSelectionBox () {
	var doWireframe : boolean = false;
	
	selectBox.gameObject.SetActive ( true );
	
	if ( selectedObject.GetComponent(Trigger) && !selectedObject.GetComponent(InteractiveObject) ) {
 		doWireframe = true;
	}
	
	selectBox.transform.position = selectedObject.transform.position;
	selectBox.transform.localScale = selectedObject.transform.localScale;
	selectBox.transform.localEulerAngles = selectedObject.transform.localEulerAngles;
	
	selectBox.GetComponent ( EditorSelectionBox ).Fit( selectedObject, doWireframe );
}

// Hide selection box
static function HideSelectionBox () {
	selectBox.gameObject.SetActive ( false );
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
	if ( selectedObject.GetComponent(Shape) ) { return; }
	
	var obj : GameObject = selectedObject;
	AddAction ( obj );
	DeselectObject ();
	Destroy ( obj );	
}

// Is object selected?
static function IsObjectSelected ( obj : GameObject ) : boolean {
	return ( selectedObject == obj );
}

// Duplicate object
static function DuplicateObject () {
	if ( selectedObject.GetComponent(Shape) ) { return; }
	
	var newObj : GameObject = Instantiate ( selectedObject );
	newObj.transform.parent = currentLevel.transform;
	newObj.name = newObj.name.Replace("(Clone)","");

	if ( newObj.GetComponent(GUID) ) { 
		newObj.GetComponent(GUID).NewGUID();
	}

	DeselectObject ();
	SelectObject ( newObj );
	SetGrabMode ( true );
}

// Deselect object
static function DeselectObject () {
	DeselectObject ( null );
}

static function DeselectObject ( nextObject : GameObject ) {	
	var selectNextObject : GameObject;
	
	if ( selectedObject.GetComponent(Actor) ) {
	
	} else if ( selectedObject.GetComponent(Surface) ) {
		if ( !nextObject || !nextObject.GetComponent(EditorVertexButton) ) {	
			selectedObject.GetComponent(Surface).ClearButtons();
		
		}
	
	}
	
	selectBox.gameObject.SetActive ( false );
	
	selectedObject = null;
	
	inspector.ClearMenus ();
	
	if ( selectNextObject ) {
		SelectObject ( selectNextObject );
	}
}

// Select face
static function FindSubMesh ( mesh : Mesh, triangleIndex : int ) : int {
	var triangle : int[] = new int [3];
	triangle[0] = mesh.triangles[triangleIndex * 3];
	triangle[1] = mesh.triangles[triangleIndex * 3 + 1];
	triangle[2] = mesh.triangles[triangleIndex * 3 + 2];
							
	for ( var i : int = 0; i < mesh.subMeshCount; i++ ) {
		var subMeshTriangles : int[] = mesh.GetTriangles ( i );
		
		for ( var j : int = 0; j < subMeshTriangles.Length; j += 3 ) {
			if ( subMeshTriangles[j] == triangle[0] && subMeshTriangles[j+1] == triangle[1] && subMeshTriangles[j+2] == triangle[2] ) {
				return i;
			}
		}
	}
	
	return 0;
}

static function SelectSubMesh ( obj : GameObject, triangleIndex : int ) {
	if ( selectedObject ) { 
		DeselectObject ();
	}
	
	var mf : MeshFilter = obj.GetComponent(MeshFilter);
	var mesh : Mesh = mf.sharedMesh;
	var subMesh : int = FindSubMesh ( mesh, triangleIndex );
	var triangles : int[] = mesh.GetTriangles(subMesh);
	var vertices : Vector3[] = new Vector3[triangles.Length];
	
	for ( var i : int = 0; i < vertices.Length; i++ ) {
		vertices[i] = mesh.vertices[triangles[i]];
		vertices[i] = obj.transform.TransformPoint ( vertices[i] );
	}
	
	selectBox.gameObject.SetActive ( true );
	selectBox.transform.position = obj.transform.position;
	selectBox.GetComponent ( EditorSelectionBox ).Fit ( vertices, triangles, false );
}

static function SelectTriangle ( obj : GameObject, triangleIndex : int ) {
	if ( selectedObject ) { 
		DeselectObject ();
	}
	
	var mf : MeshFilter = obj.GetComponent(MeshFilter);
	var mesh : Mesh = mf.mesh;
	var vertices : Vector3[] = new Vector3[3];
	var triangle : int[] = new int[3];
	triangle[0] = 0;
	triangle[1] = 1;
	triangle[2] = 2;
	
	for ( var i : int = 0; i < vertices.Length; i++ ) {
		vertices[i] = mesh.vertices [ mesh.triangles [ triangleIndex * 3 + i ] ];
		vertices[i] = obj.transform.TransformPoint ( vertices[i] );
	}
	
	selectBox.gameObject.SetActive ( true );
	selectBox.transform.position = obj.transform.position;
	selectBox.GetComponent ( EditorSelectionBox ).Fit ( vertices, triangle, false );
}

// Select object
static function SelectObject ( obj : GameObject ) {
	transformEnd = null;
		
	if ( !obj || obj.GetComponent ( OGButton3D ) ) {
		return;
	
	}
	
	if ( selectedObject ) { 
		DeselectObject ( obj );
	}
	
	selectedObject = obj;
		
	if ( obj.GetComponent ( EditorVertexButton ) ) {
		SetGrabMode ( true );
		
		transformEnd = function () {
			obj.GetComponent ( EditorVertexButton ).surface.CreateButtons();
			obj.GetComponent ( EditorVertexButton ).Remodel();
			SelectObject ( obj.GetComponent ( EditorVertexButton ).surface.gameObject );
		};
	
	}
	
	// Mark object with selection box
	FitSelectionBox ();
	
	// Check what to display in the inspector
	inspector.ClearMenus ();
	
	inspector.transformDisplay.SetActive ( obj.GetComponent ( CombinedMesh ) == null );
	
	// Shape
	if ( obj.GetComponent ( Shape ) ) {
		inspector.AddMenu ( "Shape", obj );
	}
	
	// CombinedMesh
	if ( obj.GetComponent ( CombinedMesh ) ) {
		inspector.AddMenu ( "CombinedMesh", obj );
	}
	
	// ImportedMesh
	if ( obj.GetComponent ( ImportedMesh ) ) {
		inspector.AddMenu ( "ImportedMesh", obj );
	}
	
	// Prefab
	if ( obj.GetComponent ( Prefab ) ) {
		inspector.AddMenu ( "Prefab", obj );
	}
	
	// LightSource
	if ( obj.GetComponent ( LightSource ) ) {
		inspector.AddMenu ( "Light", obj );
	}
	
	// Actor
	if ( obj.GetComponent ( Actor ) ) {
		inspector.AddMenu ( "Actor", obj );
		inspector.AddMenu ( "Path", obj );
	}
	
	// Item
	if ( obj.GetComponent ( Item ) ) {
		inspector.AddMenu ( "Item", obj );
	}
	
	// Plane
	if ( obj.GetComponent ( Surface ) ) {
		inspector.AddMenu ( "Surface", obj );
	}
	
	// Computer
	if ( obj.GetComponent ( Computer ) ) {
		inspector.AddMenu ( "Computer", obj, true );
	}
	
	// Keypad
	if ( obj.GetComponent ( Keypad ) ) {
		inspector.AddMenu ( "Keypad", obj, true );
	}
	
	// SurveillanceCamera
	if ( obj.GetComponent ( SurveillanceCamera ) ) {
		inspector.AddMenu ( "SurveillanceCamera", obj, true );
	}
	
	// SpawnPoint
	if ( obj.GetComponent ( SpawnPoint ) ) {
		inspector.AddMenu ( "SpawnPoint", obj, true );
	}
	
	// Terminal
	if ( obj.GetComponent ( Terminal ) ) {
		inspector.AddMenu ( "Terminal", obj, true );
	}
	
	// Wallet
	if ( obj.GetComponent ( Wallet ) ) {
		inspector.AddMenu ( "Wallet", obj );
	}
	
	// Lift
	if ( obj.GetComponent ( Lift ) ) {
		inspector.AddMenu ( "LiftPanel", obj, true );
	}
	
	// Trigger
	if ( obj.GetComponent ( Trigger ) ) {
		inspector.AddMenu ( "Trigger", obj );
	}
}


////////////////////
// Modes
////////////////////
// Set pick mode
static function SetPickMode ( state : boolean ) {
	pickMode = state;
	
	if ( pickMode ) {
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Pick Mode" );
		EditorModes.SetMessage ( "" );
		EditorModes.SetHeight ( 50 );
		
	} else {
		if ( pickerSender == "" ) { pickerSender = "MenuBase"; }
		OGRoot.GoToPage ( pickerSender );
		pickerSender = "";
		pickerType = null;
	
	}
}

// Set first person mode
static function ToggleFirstPersonGhost ( state : boolean ) {
	EditorCamera.GetInstance().cursor.GetComponent(Rigidbody).useGravity = !state;
	EditorCamera.GetInstance().cursor.GetComponent(CapsuleCollider).enabled = !state;
	EditorCamera.GetInstance().cursor.GetComponent(Rigidbody).velocity = Vector3.zero;
}

static function ToggleFirstPersonGhost () {
	ToggleFirstPersonGhost ( EditorCamera.GetInstance().cursor.GetComponent(Rigidbody).useGravity );
}

static function GetFirstPersonGhost () : boolean {
	return !EditorCamera.GetInstance().cursor.GetComponent(Rigidbody).useGravity;
}

static function SetFirstPersonMode ( state : boolean ) {
	firstPersonMode = state;
	ToggleFirstPersonGhost ( !firstPersonMode );
	
	if ( firstPersonMode ) {
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "First Person Mode" );
		EditorModes.SetMessage ( "" );
		EditorModes.SetHeight ( 32 );
	
	} else {
		OGRoot.GoToPage ( "MenuBase" );
	
	}
}

// Set grab mode
static function SetGrabMode ( state : boolean ) {
	if ( !selectedObject || selectedObject.GetComponent ( CombinedMesh ) ) {
		return;
	}
		
	grabMode = state;
	
	if ( grabMode ) {
		AddAction ( selectedObject );
		
		grabOrigPoint = selectedObject.transform.position;
		
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Grab Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse mouse to move" );
		EditorModes.SetHeight ( 90 );
		
		gizmo.SetActive ( true );
		gizmo.transform.position = selectedObject.transform.position;
		gizmo.transform.localEulerAngles = Vector3.zero;
	
		grabDistance = Vector3.Distance ( Camera.main.transform.position, selectedObject.transform.position );
		grabOrigPoint = selectedObject.transform.position;
	
	} else {
		OGRoot.GoToPage ( "MenuBase" );
		
		SetRestriction ( null );
		gizmo.SetActive ( false );
		gizmo.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
	}
}

// Set rotate mode
static function SetRotateMode ( state : boolean ) {
	if ( !selectedObject || selectedObject.GetComponent ( EditorVertexButton ) || selectedObject.GetComponent ( CombinedMesh ) ) {
		return;
	}
		
	rotateMode = state;
	
	if ( rotateMode ) {
		AddAction ( selectedObject );
		
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Rotate Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse scroll wheel to rotate\nHold Shift or Ctrl to change speed" );
		EditorModes.SetHeight ( 110 );
		
		gizmo.SetActive ( true );
		gizmo.transform.position = selectedObject.transform.position;
		gizmo.transform.rotation = selectedObject.transform.rotation;
	
	} else {
		OGRoot.GoToPage ( "MenuBase" );
		
		SetRestriction ( null );
		gizmo.SetActive ( false );
		gizmo.transform.localScale = new Vector3 ( 0.5, 0.5, 0.5 );
	}
}

// Set scale mode
static function SetScaleMode ( state : boolean ) {
	if ( !selectedObject || selectedObject.GetComponent ( EditorVertexButton ) || selectedObject.GetComponent ( CombinedMesh ) ) {
		return;
	}
		
	scaleMode = state;
	
	if ( scaleMode ) {
		AddAction ( selectedObject );
		
		OGRoot.GoToPage ( "Modes" );
		EditorModes.SetTitle ( "Scale Mode" );
		EditorModes.SetMessage ( "Press X, Y or Z to change axis\nUse scroll wheel to scale\nHold Shift or Ctrl to change speed" );
		EditorModes.SetHeight ( 110 );
		
		gizmo.SetActive ( true );
		gizmo.transform.position = selectedObject.transform.position;
		gizmo.transform.rotation = selectedObject.transform.rotation;
	
	} else {
		OGRoot.GoToPage ( "MenuBase" );
		
		SetRestriction ( null );
		gizmo.SetActive ( false );
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

// Save file
function DoSave ( path : String ) : IEnumerator {
	yield new WaitForEndOfFrame();
	
	var tex : Texture2D = new Texture2D(Screen.width, Screen.height);	
	tex.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);
	TextureScale.Bilinear ( tex, tex.width * 0.25, tex.height * 0.25 );	
	
	Saver.SaveMap ( path, EditorCore.currentLevel, tex );
}

function SaveFile ( path : String ) {
	StartCoroutine ( DoSave ( path ) );
}

// Trim filename
static function TrimFileName ( p : String ) : String {
	var path = p.Split("\\"[0]);
	var fileName = path[path.Length-1];
	var extention = fileName.Split("."[0]);
	var name = extention[0];
	
	return name;
}

// Get spawnpoints
static function GetSpawnPoints ( m : String ) : String[] {
	return Loader.LoadSpawnPoints ( m );
}

// Load file
static function LoadFile ( path : String ) {
	var parent = currentLevel.transform.parent;
	Destroy ( currentLevel );
	currentLevel = null;
	
	var skyBoxParent : Transform = GameObject.FindWithTag("SkyboxCamera").transform.parent;
	if ( skyBoxParent.gameObject.GetComponentInChildren ( SkyBox ) ) {
		Destroy ( parent.gameObject.GetComponentInChildren ( SkyBox ).gameObject );
	}
	
	currentLevel = Loader.LoadMap ( path );
	
	currentLevel.transform.parent = parent;
	currentLevel.transform.localPosition = Vector3.zero;
}

// Load OBJ
static function LoadOBJ ( objName : String, asNavMesh : boolean ) {
	var go : GameObject = new GameObject ( objName, MeshFilter, MeshRenderer, MeshCollider );
	var mi : OBJImporter = new OBJImporter();
		
	go.transform.parent = currentLevel.transform;
	
	var mesh : Mesh = mi.ImportFile ( Application.dataPath + "/ImportOBJ/" + objName + ".obj" );
	mesh.name = objName;
	
	go.GetComponent(MeshFilter).mesh = mesh;
	go.GetComponent(MeshCollider).sharedMesh = mesh;
	
	if ( asNavMesh ) {
		go.AddComponent(OPNavMesh);
		go.GetComponent(MeshRenderer).material = navMeshMaterial;
	
	} else {
		go.GetComponent(MeshRenderer).material = defaultMaterial;

	}
			
	SelectObject ( go );
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
	return TrimFileNames ( Directory.GetFiles ( Application.dataPath + "/Story/Conversations/" + chapter + "/" + scene + "/" + name, "*.vgconvo" ) );
}

static function GetConvoTrees ( chapter : String, scene: String ) : String[] {
	return TrimFileNames ( Directory.GetFiles ( Application.dataPath + "/Story/Conversations/" + chapter + "/" + scene, "*.vgconvo" ) );
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
// Get instance
public static function GetInstance () : EditorCore {
	return instance;
}

// Init
function Start () {
	running = true;
	
	workspace = _workspace;
	gizmo = _gizmo;
	previewCamera = _previewCamera;
	root = this.transform.parent;
	instance = this;
	selectBox = _selectBox;
	selectBoxDefaultMesh = _selectBoxDefaultMesh;
	undoContainer = _undoContainer;
	defaultMaterial = _defaultMaterial;
	navMeshMaterial = _navMeshMaterial;

	currentLevel = workspace.transform.GetChild(0).gameObject;
	
	gizmo.SetActive ( false );

	if ( initMap ) {
		LoadFile ( initMap );
	}
	

	Camera.main.transform.position = initPos;
	Camera.main.transform.eulerAngles = initRot;
	
	// signal
	GameCore.Print ("EditorCore | started");
}

// Quit
static function Stop () {
	running = false;
}

// Update
function Update () {
	if ( transformUpdate ) {
		transformUpdate ();
	}
}