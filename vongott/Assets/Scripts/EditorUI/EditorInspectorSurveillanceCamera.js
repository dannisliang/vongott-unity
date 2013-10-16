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
			door.text = "Door";
			door.hiddenString = cam.doorGUID;
		}
		
		attack.selectedOption = cam.target.ToString();
	}
	
	public function UpdateObject () {
		if ( !cam ) {
			cam = EditorCore.GetSelectedObject().GetComponent ( SurveillanceCamera );
		}
		
		if ( door.hiddenString != "" ) {
			cam.door = null;
			cam.doorGUID = door.hiddenString;
		}
		
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
}