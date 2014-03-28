#pragma strict

class EditorInspectorSurveillanceCamera extends MonoBehaviour {
	public var attack : OGPopUp;
	public var door : OGButton;
	
	private var cam : SurveillanceCamera;
	
	public function Init ( obj : GameObject ) {
		cam = obj.GetComponent ( SurveillanceCamera ); 
	
		if ( cam.door ) {
			door.text = cam.door.name;
			door.hiddenString = cam.door.GetComponent(GUID).GUID;
		
		} else if ( cam.doorGUID != "" ) {
			var doorObject : GameObject = EditorCore.GetObjectFromGUID ( cam.doorGUID );
			
			if ( doorObject ) {
				door.text = doorObject.name;
				door.hiddenString = cam.doorGUID;
			} else {
				door.hiddenString = "";
				door.text = "(none)";
			}
		} else {
			door.hiddenString = "";
			door.text = "(none)";
		}
		
		attack.selectedOption = cam.target.ToString();
	}
	
	public function UpdateObject () {
		if ( !cam ) {
			cam = EditorCore.GetSelectedObject().GetComponent ( SurveillanceCamera );
		}
		
		cam.door = null;
		cam.doorGUID = door.hiddenString;
		
		cam.SetTarget ( attack.selectedOption );
	}
	
	public function PickDoor () {
		EditorCore.pickerType = Door;
		EditorCore.pickerCallback = function ( n : String, id : String ) {
			door.text = n;
			door.hiddenString = id;
		
			UpdateObject ();
		};
		
		EditorCore.SetPickMode ( true );
	}

	public function PickNone () {
		door.hiddenString = "";
		door.text = "(none)";
	
		UpdateObject ();
	}
}
