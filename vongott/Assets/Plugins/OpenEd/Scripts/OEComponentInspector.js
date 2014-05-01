﻿#pragma strict

public class OEVector3Field {
	public var x : OGTextField;
	public var y : OGTextField;
	public var z : OGTextField;

	public function In ( v : Vector3 ) {
		x.text = v.x.ToString();
		y.text = v.y.ToString();
		z.text = v.z.ToString();
	}

	public function Out () : Vector3 {
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

public class OEObjectField {
	public var button : OGButton;

	private var obj : Object;

	public function In ( obj : Object, type : System.Type ) {
		this.obj = obj;
		
		button.func = function () {
			OEWorkspace.GetInstance().PickObject ( function ( picked : Object ) {
				this.obj = picked;
			}, type );
		};
	}

	public function Out () : Object {
		if ( obj ) {
			button.text = ( obj as GameObject ).name;
		} else {
			button.text = "(none)";
		}

		return obj;
	}
}

public class OEPopup {
	public var popup : OGPopUp;

	public function In ( selected : int, strings : String [] ) {
		popup.options = strings;
		popup.selectedOption = strings[selected];
	}

	public function Out () : int {
		for ( var i : int = 0; i < popup.options.Length; i++ ) {
			if ( popup.selectedOption == popup.options[i] ) {
				return i;
			}
		}
		
		return 0;
	}	
}

public class OEFloatField {
	public var textfield : OGTextField;

	public function In ( value : float ) {
		textfield.text = value.ToString ();
	}

	public function Out () : float {
		var value : float;

		float.TryParse ( textfield.text, value );
		
		return value;
	}	
}

public class OEIntField {
	public var textfield : OGTextField;

	public function In ( value : int ) {
		textfield.text = value.ToString ();
	}

	public function Out () : int {
		var value : int;

		int.TryParse ( textfield.text, value );
		
		return value;
	}	
}

public class OETextField {
	public var textfield : OGTextField;

	public function In ( string : String ) {
		textfield.text = string;
	}

	public function Out () : String {
		return textfield.text;
	}	
}

public class OEComponentInspector extends MonoBehaviour {
	public var type : OFFieldType;
	@HideInInspector public var target : OFSerializedObject;

	public function get typeId () : String {
		return type.ToString();
	}

	public function Out () {}
	
	public function In () {}

	public function Init ( obj : OFSerializedObject ) {
		target = obj;
		In ();
	}
	
	public function Update () {
       		if ( target ) {
			Out ();
		}
	}
}