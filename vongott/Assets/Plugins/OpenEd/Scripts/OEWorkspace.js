﻿#pragma strict

public enum OETransformMode {
	Position,
	Rotation,
	Scale
}

public class OEUndoAction {
	public var oldGO : GameObject;
	public var newGO : GameObject;

	function OEUndoAction ( oldGO : GameObject ) {
		this.oldGO = oldGO;
		newGO = MonoBehaviour.Instantiate ( oldGO );
		oldGO.SetActive ( false );
	}

	public function Clear () {
		MonoBehaviour.Destroy ( oldGO );
	}

	public function Undo () {
		oldGO.SetActive ( true );
		newGO.SetActive ( false );
	}
	
	public function Redo () {
		oldGO.SetActive ( false );
		newGO.SetActive ( true );
	}
}

public class OEWorkspace extends MonoBehaviour {
	private class PreferredParent {
		public var type : OFFieldType;
		public var parent : Transform;
	}
	
	public var cam : OECamera;
	public var fileBrowser : OEFileBrowser;
	public var inspector : OEInspector;
	public var picker : OEPicker;
	public var previewCamera : OEPreviewCamera;
	public var toolbar : OEToolbar;
	public var currentMap : String = "";
	
	public var preferredParents : PreferredParent[];
	public var transformMode : OETransformMode;
	public var gizmoPosition : OEGizmo;
	public var gizmoRotation : OEGizmo;
	public var gizmoScale : OEGizmo;
	public var serializedTransforms : Transform[];

	@HideInInspector public var focusPoint : Vector3;
	@HideInInspector public var selection : List.< OFSerializedObject > = new List.< OFSerializedObject > ();

	private var undoBuffer : List.< OEUndoAction > = new List.< OEUndoAction > ();
	private var lastUndo : int = -1;
	private var currentSavePath : String;

	public static var instance : OEWorkspace;

	public static function GetInstance () : OEWorkspace {
		return instance;
	}

	// Refresh data
	public function RefreshAll () {
		inspector.Refresh ( selection );
		toolbar.Refresh ();
		cam.lights = this.GetComponentsInChildren.< Light >();
	}

	// File I/O
	public function OpenFile () {
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Open;
		fileBrowser.callback = function ( file : FileInfo, path : String ) { currentSavePath = path; };
		fileBrowser.sender = "Home";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	public function Save () {
		if ( String.IsNullOrEmpty ( currentSavePath ) ) {
			SaveAs ();
		
		} else {
			OFWriter.SaveChildren ( serializedTransforms, currentSavePath );
		
		}
	}

	public function SaveAs () {
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Save;
		fileBrowser.callback = function ( path : String ) { currentSavePath = path; Save(); };
		fileBrowser.sender = "Home";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	// Pick things
	public function PickObject ( callback : Function, type : System.Type ) {
		picker.callback = callback;
		picker.type = type;
		fileBrowser.sender = "Home";
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}

	public function PickPrefab ( callback : Function, type : System.Type ) {
		var drawer : OEPrefabsDrawer = toolbar.OpenDrawer ( "Prefabs" ) as OEPrefabsDrawer;

		if ( drawer ) {
			drawer.SetPicker ( callback, type );
		}
	}
	
	public function PickFile ( callback : Function, filterString : String ) {
		fileBrowser.callback = callback;
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Open;
		fileBrowser.filter = filterString;
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	// Searching
	public function FindObject ( id : String ) : OFSerializedObject {
		var result : OFSerializedObject;
		var allObjects : OFSerializedObject[] = this.GetComponentsInChildren.< OFSerializedObject >();

		for ( var i : int = 0; i < allObjects.Length; i++ ) {
			if ( allObjects[i].id == id ) {
				result = allObjects[i];
				break;
			}
		}

		return result;
	}

	// Undo buffer
	public function UndoLastAction () {
		if  ( undoBuffer.Count > 0 ) {
			if ( lastUndo < 0 ) {
				lastUndo = undoBuffer.Count;
			}

			lastUndo--;

			undoBuffer[lastUndo].Undo();
		}
	}

	public function RedoLastAction () {
		if  ( undoBuffer.Count > 0 ) {
			if ( lastUndo >= 0 && lastUndo < undoBuffer.Count ) {
				lastUndo++;

				undoBuffer[lastUndo].Redo();
			}
		}
	}
	
	public function AddToUndoBuffer ( go : GameObject ) {
		if ( undoBuffer.Count > 20 ) {
			var aDestroy : OEUndoAction = undoBuffer[0];
			aDestroy.Clear ();
			undoBuffer.RemoveAt ( 0 );
		}
		
		undoBuffer.Add ( new OEUndoAction ( go ) );
	}

	// Transform modes
	public function SetTransformMode ( mode : String ) {
		var names : String[] = System.Enum.GetNames ( OETransformMode );
		var result : OETransformMode;
		
		for ( var i : int = 0; i < names.Length; i++ ) {
			if ( names[i] == mode ) {
				result = i;
			}
		}

		SetTransformMode ( result );
	}
	
	public function SetTransformMode ( mode : OETransformMode ) {
		transformMode = mode;
	}

	// Selection
	public function ClearSelection () {
		instance.selection.Clear ();

		RefreshAll ();
	}

	public function IsSelected ( obj : OFSerializedObject ) {
		for ( var i : int = 0; i < selection.Count; i++ ) {
			if ( selection[i] == obj ) {
				return true;
			}
		}

		return false;
	}

	public function SelectObject ( id : String ) {
		SelectObject ( FindObject ( id ) );
	}

	public function SelectObject ( obj : OFSerializedObject ) {
		if ( !obj ) {
			ClearSelection ();
		
		} else {
			var additive : boolean = Input.GetKey ( KeyCode.LeftShift ) || Input.GetKey ( KeyCode.RightShift );

			if ( !additive ) {
				instance.selection.Clear ();
			}

			instance.selection.Add ( obj );

			RefreshAll ();
		
		}
	}

	// Place
	public function PlaceAtCursor ( obj : OFSerializedObject ) {
		var prevScale : Vector3 = obj.transform.localScale;
		
		obj.transform.parent = GetPreferredParent ( obj );
		obj.transform.position = focusPoint;
		obj.transform.localScale = prevScale;
	}

	// Add
	public function GetPreferredParent ( obj : OFSerializedObject ) : Transform {
		for ( var i : int = 0; i < preferredParents.Length; i++ ) {
			if ( obj.HasFieldType ( preferredParents[i].type ) ) {
				return preferredParents[i].parent;
			}
		}

		return this.transform;
	}
	
	public function AddLight () {
		var obj : OFSerializedObject = new GameObject ( "Light", Light, SphereCollider ).AddComponent.< OFSerializedObject > ();
		
		obj.SetField ( "Light", obj.GetComponent.< Light > () );
		PlaceAtCursor ( obj );
	
		SelectObject ( obj );

		RefreshAll ();
	}

	// Delete
	public function DeleteSelection () {
		for ( var i : int = 0; i < selection.Count; i++ ) {
			Destroy ( selection[i].gameObject );
		}

		selection.Clear ();
	}

	// Instatiate
	public function AddPrefab ( path : String ) : OFSerializedObject {
		var go : GameObject = Instantiate ( Resources.Load ( path ) ) as GameObject;
		var obj : OFSerializedObject;
		
		if ( go ) {
			var origScale : Vector3 = go.transform.localScale;

			go.transform.parent = instance.transform;
			go.transform.localScale = origScale;
			go.transform.position = focusPoint;

			var rb : Rigidbody = go.GetComponentInChildren.< Rigidbody > ();

			if ( rb ) {
				rb.isKinematic = true;
				rb.useGravity = false;
			}

			obj = go.GetComponent.< OFSerializedObject > ();

			go.name = go.name.Replace ( "(Clone)", "" );

			SelectObject ( obj );
		}

		return obj;
	}

	// Duplicate
	public function DuplicateSelection () {
		for ( var i : int = 0; i < selection.Count; i++ ) {
			var newObj : OFSerializedObject = Instantiate ( selection[i] );
			newObj.transform.parent = selection[i].transform.parent;
			newObj.transform.localPosition = selection[i].transform.localPosition;
			newObj.transform.localRotation = selection[i].transform.localRotation;
			newObj.transform.localScale = selection[i].transform.localScale;
			newObj.gameObject.name = selection[i].gameObject.name;
			newObj.RenewId ();
		}

		RefreshAll ();
	}

	// Focus
	public function GetFocus () : Vector3 {
		return instance.focusPoint;
	}
	
	public function SetFocus ( point : Vector3 ) {
		instance.focusPoint = point;
	}

	// Init
	public function Start () {
		instance = this;
	}

	// Update
	public function Update () {
		// Gizmos
		if ( selection.Count > 0 ) {
			gizmoPosition.gameObject.SetActive ( transformMode == gizmoPosition.mode );
			gizmoScale.gameObject.SetActive ( transformMode == gizmoScale.mode );
			gizmoRotation.gameObject.SetActive ( transformMode == gizmoRotation.mode );
		
		} else {
			gizmoPosition.gameObject.SetActive ( false );
			gizmoScale.gameObject.SetActive ( false );
			gizmoRotation.gameObject.SetActive ( false );

		}
		
		// Input
		var ctrlOrCmd : boolean = Input.GetKey ( KeyCode.LeftControl ) || Input.GetKey ( KeyCode.RightControl ) || Input.GetKey ( KeyCode.LeftCommand ) || Input.GetKey ( KeyCode.RightCommand );

		if ( Input.GetKeyDown ( KeyCode.D ) && ctrlOrCmd ) {
			DuplicateSelection ();
		
		} else if ( Input.GetKeyDown ( KeyCode.Delete ) || Input.GetKeyDown ( KeyCode.Backspace ) ) {
			DeleteSelection ();

		}

		// Inspector visibility
		inspector.SetActive ( selection.Count == 1 && ( toolbar.collapsed || !toolbar.stretched ) );	
	}
}
