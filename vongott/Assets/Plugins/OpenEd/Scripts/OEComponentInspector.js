#pragma strict

public class OEField {
	public var enabled : boolean = true;
	
	private var setCounter : int = 0;

	public function get canSet () : boolean {
		if ( setCounter > 0 ) {
			setCounter--;
		}
		
		return setCounter == 0;
	}

	public function set canSet ( value : boolean ) {
		setCounter = value ? 2 : -1;
	}

	public function set canSetForce ( value : boolean ) {
		setCounter = value ? 0 : -1;
	}

	public function CheckEnabled ( w : OGWidget [] ) : boolean {
		for ( var i : int = 0; i < w.Length; i++ ) {
			w[i].tint.a = enabled ? 1.0 : 0.5;
			w[i].isDisabled = !enabled;
		}

		return enabled;
	}
}

public class OEVector3Field extends OEField {
	public var x : OGTextField;
	public var y : OGTextField;
	public var z : OGTextField;

	public function get listening () : boolean {
		return x.listening || y.listening || z.listening;
	}

	public function Set ( v : Vector3 ) : Vector3 {
		if ( !CheckEnabled ( [ x, y, x ] ) ) { return new Vector3(); }
		
		if ( !listening ) {
			x.text = ( Mathf.Round ( v.x * 1000 ) / 1000 ).ToString();
			y.text = ( Mathf.Round ( v.y * 1000 ) / 1000 ).ToString();
			z.text = ( Mathf.Round ( v.z * 1000 ) / 1000 ).ToString();
		}

		return Out();
	}

	public function Out () : Vector3 {
		var nx : float;
		var ny : float; 
		var nz : float;
		
		x.text = x.text.Replace ( "\n", "" );
		y.text = y.text.Replace ( "\n", "" );
		z.text = z.text.Replace ( "\n", "" );

		float.TryParse ( x.text, nx );
		float.TryParse ( y.text, ny );
		float.TryParse ( z.text, nz );

		return new Vector3 ( nx, ny, nz );
	}
}

public class OEColorField extends OEField {
	public var r : OGTextField;
	public var g : OGTextField;
	public var b : OGTextField;
	public var a : OGTextField;

	public function get listening () : boolean {
		return r.listening || g.listening || b.listening || a.listening;
	}

	public function Set ( c : Color ) : Color {
		if ( !CheckEnabled ( [ r, g, b, a ] ) ) { return new Color(); }
		
		if ( !listening ) {
			r.text = ( Mathf.Round ( c.r * 1000 ) / 1000 ).ToString();
			g.text = ( Mathf.Round ( c.g * 1000 ) / 1000 ).ToString();
			b.text = ( Mathf.Round ( c.b * 1000 ) / 1000 ).ToString();
			a.text = ( Mathf.Round ( c.a * 1000 ) / 1000 ).ToString();
		}

		return Out ();
	}

	public function Out () : Color {
		var nr : float;
		var ng : float; 
		var nb : float;
		var na : float;
		
		r.text = r.text.Replace ( "\n", "" );
		g.text = g.text.Replace ( "\n", "" );
		b.text = b.text.Replace ( "\n", "" );
		a.text = a.text.Replace ( "\n", "" );

		float.TryParse ( r.text, nr );
		float.TryParse ( g.text, ng );
		float.TryParse ( b.text, nb );
		float.TryParse ( a.text, na );

		return new Color ( nr, ng, nb, na );
	}
}

public class OEButton extends OEField {
	public var button : OGButton;

	public function Set ( func : Function ) {
		if ( !CheckEnabled ( [ button ] ) ) { 
			button.func = null;
		
		} else {
			button.func = func;
		}
	}
}

public class OEPointField extends OEField {
	public var button : OGButton;

	private var pos : Vector3;
		
	public function Set ( p : Vector3 ) : Vector3 {
		if ( !CheckEnabled ( [ button ] ) ) { return Vector3.zero; }
		
		if ( canSet ) {
			pos = p;

			button.func = function () {
				canSet = false;

				OEWorkspace.GetInstance().PickPoint ( function ( picked : Vector3 ) {
					picked.x = Mathf.Round ( picked.x * 10 ) / 10;
					picked.y = Mathf.Round ( picked.y * 10 ) / 10;
					picked.z = Mathf.Round ( picked.z * 10 ) / 10;
					
					pos = picked;
					canSet = true;
				} );
			};
		}

		return Out ();
	}

	public function Out () : Vector3 {
		button.text = pos.x + "," + pos.y + "," + pos.x;
		
		return pos;
	}
}

public class OEObjectField extends OEField {
	public var button : OGButton;
	public var clear : OGButton; 

	private var obj : Object;

	public function Clear () {
		obj = null;
		canSet = true;
	}

	public function Set ( setObj : Object, sysType : System.Type, strType : String ) : Object {
		Set ( setObj, sysType, strType, null );
	}

	public function Set ( setObj : Object, sysType : System.Type, strType : String, attachTo : OFSerializedObject ) : Object {
		if ( !CheckEnabled ( [ button, clear ] ) ) { return null; }
		
		if ( canSet ) {
			obj = setObj;
			
			button.func = function () {
				canSet = false;
				
				OEWorkspace.GetInstance().PickFile ( function ( file : System.IO.FileInfo ) {
					var json : JSONObject = OFReader.LoadFile ( file.FullName );
					var so : OFSerializedObject = OFDeserializer.Deserialize ( json, attachTo );
					obj = so.GetComponent ( sysType );

					canSet = true;
				}, strType );
			};
		}

		return Out ();
	}

	public function Set ( setObj : Object, sysType : System.Type, allowSceneObjects : boolean) : Object {
		if ( !CheckEnabled ( [ button, clear ] ) ) { return null; }
		
		if ( canSet ) {
			obj = setObj;
			
			button.func = function () {
				canSet = false;
				
				if ( allowSceneObjects ) {		
					OEWorkspace.GetInstance().PickObject ( function ( picked : Object ) {
						obj = picked;
						canSet = true;
					}, sysType );
				
				} else {
					OEWorkspace.GetInstance().PickPrefab ( function ( picked : Object ) {
						obj = picked;
						canSet = true;
					}, sysType );
				}
			};
		}

		return Out ();
	}

	public function Out () : Object {
		clear.func = Clear;
		
		var go : GameObject;
		
		if ( obj ) {
			var c : Component = obj as Component;

			if ( c ) {
				go = c.gameObject;
			} else {
				go = obj as GameObject;
			}

		}

		if ( go ) {
			button.text = go.name;
		
		} else {
			button.text = "None";

		}
		
		return obj;
	}
}

public class OELabelField extends OEField {
	public var label : OGLabel;

	public function Set ( text : String ) {
		CheckEnabled ( [ label ] );

		label.text = text;
	}
}

public class OEPopup extends OEField {
	public var popup : OGPopUp;

	public function Set ( selected : int, strings : String [] ) : int {
		if ( !CheckEnabled ( [ popup ] ) ) { return 0; }
		
		if ( canSet ) {
			popup.options = strings;
			if ( strings.Length > 0 ) {
				popup.selectedOption = strings[selected];
			} else {
				popup.selectedOption = "";
			}
		}
		
		canSetForce = !popup.isUp;

		return Out ();
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

public class OEToggle extends OEField {
	public var tickbox : OGTickBox;

	public function Set ( isTicked : boolean ) : boolean {
		if ( !CheckEnabled ( [ tickbox ] ) ) { return false; }
		
		if ( canSet ) {
			tickbox.isTicked = isTicked;
			canSet = true;
		}

		return Out ();
	}

	public function Out () : boolean {
		return tickbox.isTicked;
	}
}

public class OESlider extends OEField {
	public var slider : OGSlider;

	private var min : float;
	private var max : float;
	
	private function CalcValue ( value : float ) : float {
		return ( ( max - min ) * value ) + min;
	}

	private function CalcValuePercent ( value : float ) : float {
		return ( value - min ) / ( max - min );
	}

	public function Set ( value : float, min : float, max : float ) : float {
		if ( !CheckEnabled ( [ slider ] ) ) { return 0; }
		
		if ( canSet ) {
			this.min = min;
			this.max = max;

			slider.sliderValue = CalcValuePercent ( value );
		}

		return Out ();
	}

	public function Out () : float {
		return CalcValue ( slider.sliderValue );
	}	
}

public class OEFloatField extends OEField {
	public var textfield : OGTextField;

	public function Set ( value : float ) : float {
		if ( !CheckEnabled ( [ textfield ] ) ) { return 0; }
		
		if ( !textfield.listening ) {
			textfield.text = value.ToString ();
		}

		return Out ();
	}

	public function Out () : float {
		var value : float;

		textfield.text = textfield.text.Replace ( "\n", "" );
		
		float.TryParse ( textfield.text, value );
		
		return value;
	}	
}

public class OEIntField extends OEField {
	public var textfield : OGTextField;

	public function Set ( value : int ) : int {
		if ( !CheckEnabled ( [ textfield ] ) ) { return 0; }
		
		if ( !textfield.listening ) {	
			textfield.text = value.ToString ();
		}

		return Out ();
	}

	public function Out () : int {
		var value : int;
		
		textfield.text = textfield.text.Replace ( "\n", "" );

		int.TryParse ( textfield.text, value );
		
		return value;
	}	
}

public class OETextField extends OEField {
	public var textfield : OGTextField;

	public function Set ( string : String ) : String {
		if ( !CheckEnabled ( [ textfield ] ) ) { return ""; }
		
		if ( !textfield.listening ) {
			textfield.text = string;
		}
		
		return Out ();
	}

	public function Out () : String {
		textfield.text = textfield.text.Replace ( "\n", "" );
		
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
