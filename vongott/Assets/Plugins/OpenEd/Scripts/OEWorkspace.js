#pragma strict

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
	public var inspector : OEInspector;
	public var picker : OEPicker;
	public var fileBrowser : OEFileBrowser;
	public var toolbar : OEToolbar;
	public var transformMode : OETransformMode;
	public var gizmoPosition : OEGizmo;
	public var gizmoRotation : OEGizmo;
	public var gizmoScale : OEGizmo;

	@HideInInspector public var focusPoint : Vector3;
	@HideInInspector public var selection : List.< OFSerializedObject > = new List.< OFSerializedObject > ();

	private var undoBuffer : List.< OEUndoAction > = new List.< OEUndoAction > ();
	private var lastUndo : int = -1;

	public static var instance : OEWorkspace;

	public static function GetInstance () : OEWorkspace {
		return instance;
	}

	// Refresh data
	public function RefreshAll () {
		inspector.Refresh ( selection );
		toolbar.Refresh ();
	}

	// File I/O
	public function OpenFile () {
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Open;
		fileBrowser.callback = function ( file : FileInfo ) {};
		fileBrowser.sender = "Home";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	public function SaveAs () {
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Save;
		fileBrowser.callback = function ( path : String ) {};
		fileBrowser.sender = "Home";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	// Pick things
	public function PickObject ( callback : Function, type : System.Type ) {
		picker.callback = callback;
		picker.type = type;
		OGRoot.GetInstance().GoToPage ( "Picker" );
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

	public function SelectObject ( obj : OFSerializedObject ) {
		var additive : boolean = Input.GetKey ( KeyCode.LeftShift ) || Input.GetKey ( KeyCode.RightShift );

		if ( !additive ) {
			instance.selection.Clear ();
		}

		instance.selection.Add ( obj );

		RefreshAll ();
	}

	// Instatiate
	public function AddPrefab ( path : String, pos : Vector3 ) : OFSerializedObject {
		var go : GameObject = Instantiate ( Resources.Load ( path ) ) as GameObject;
		var obj : OFSerializedObject;
		
		if ( go ) {
			var origScale : Vector3 = go.transform.localScale;

			go.transform.parent = instance.transform;
			go.transform.localScale = origScale;

			obj = go.GetComponent.< OFSerializedObject > ();
		}

		return obj;
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
		
	}
}
