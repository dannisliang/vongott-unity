#pragma strict

public class OEVector3Field {
	public var x : OGTextField;
	public var y : OGTextField;
	public var z : OGTextField;

	public function Read ( v : Vector3 ) {
		x.text = v.x.ToString();
		y.text = v.y.ToString();
		z.text = v.z.ToString();
	}

	public function Write () : Vector3 {
		var nx : float;
		var ny : float; 
		var nz : float;

		float.TryParse ( x.text, nx );
		float.TryParse ( y.text, ny );
		float.TryParse ( z.text, nz );

		return new Vector3 ( nx, ny, nz );
	}

	public function Clear () {
		x.text = "";
		y.text = "";
		z.text = "";
	}
}
	
public class OEInspector extends MonoBehaviour {
	public var objectName : OGTextField;
	public var transformInspector : OETransformInspector;
	public var componentContainer : Transform;
	public var componentTypes : OEComponentInspector[];
	public var componentSwitch : OGPopUp;
	
	@HideInInspector public var selection : OFSerializedObject[];

	public function Clear () {
		for ( var i : int = 0; i < componentContainer.childCount; i++ ) {
			Destroy ( componentContainer.GetChild ( i ).gameObject );
		}
	}

	public function IsComponentSupported ( name : String ) : boolean {
		for ( var i : int = 0; i < componentTypes.Length; i++ ) {
			if ( componentTypes[i].typeId == name ) {
				return true;
			}	
		}

		return false;
	}

	private function ReadName () {
		if ( OEWorkspace.GetInstance().selection.Count == 1 ) {
			objectName.text = OEWorkspace.GetInstance().selection[0].gameObject.name;
		
		} else {
			objectName.text = "( multiple objects selected )";
		
		}
	}
	
	private function WriteName () {
		if ( OEWorkspace.GetInstance().selection.Count == 1 ) {
			OEWorkspace.GetInstance().selection[0].gameObject.name = objectName.text;
		}
	}

	public function Update () {
		WriteName ();
	}

	public function Refresh ( list : List.< OFSerializedObject > ) {
		Clear ();

		selection = list.ToArray ();

		if ( selection.Length > 0 ) {
			objectName.gameObject.SetActive ( true );
			transformInspector.gameObject.SetActive ( true );
			componentContainer.gameObject.SetActive ( true );
			componentSwitch.gameObject.SetActive ( true );

			transformInspector.Init ( selection );

			ReadName ();
			
			var tmpStrings : List.< String > = new List.< String > ();
			var tmpComponents : List.< Component > = new List.< Component > ();

			for ( var i : int = 0; i < selection.Length; i++ ) {
				var obj : OFSerializedObject = selection[i];
				
				for ( var f : int = 0; f < obj.fields.Length; f++ ) {
					if ( obj.fields[f].component && obj.fields[f].name != "Transform" && IsComponentSupported ( obj.fields[f].name ) ) {
						tmpStrings.Add ( obj.fields[f].name );
						tmpComponents.Add ( obj.fields[f].component );
					}
				}
			}

			componentSwitch.options = tmpStrings.ToArray ();
		
		} else {
			objectName.gameObject.SetActive ( false );
			transformInspector.gameObject.SetActive ( false );
			componentContainer.gameObject.SetActive ( false );
			componentSwitch.gameObject.SetActive ( false );
		
		}
	}
}
