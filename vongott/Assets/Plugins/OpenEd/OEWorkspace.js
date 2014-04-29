#pragma strict

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
	public var focusPoint : Vector3;
	public var selection : List.< OFSerializedObject > = new List.< OFSerializedObject > ();
	public var undoBuffer : List.< OEUndoAction > = new List.< OEUndoAction > ();

	private var lastUndo : int = -1;

	public static var instance : OEWorkspace;

	public static function GetInstance () : OEWorkspace {
		return instance;
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

	// Selection
	public function SelectObject ( obj : OFSerializedObject, additive : boolean ) {
		if ( !additive ) {
			instance.selection.Clear ();
		}

		instance.selection.Add ( obj );
		instance.inspector.SetObject ( obj );
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
}
