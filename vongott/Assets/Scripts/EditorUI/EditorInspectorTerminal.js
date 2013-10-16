#pragma strict

class EditorInspectorTerminal extends MonoBehaviour {
	public var buttons : OGButton[] = new OGButton[3];
	public var passCode : OGTextField;
	public var difficulty : OGPopUp;
	
	private var terminal : Terminal;
	
	public function Init ( obj : GameObject ) {
		terminal = obj.GetComponent ( Terminal );
		
		for ( var i = 0; i < terminal.cameraGUIDs.Length; i++ ) {
			if ( !String.IsNullOrEmpty ( terminal.cameraGUIDs[i] ) ) {
				buttons[i].hiddenString = terminal.cameraGUIDs[i];
				buttons[i].text = "Camera";
			}
		}
		
		passCode.text = terminal.passCode;
		
		difficulty.selectedOption = terminal.difficulty.ToString();
	}
	
	public function UpdateObject () {
		if ( !terminal ) { return; }
		
		if ( difficulty.selectedOption != "<level>" && difficulty.selectedOption != "" ) {
			terminal.difficulty = int.Parse ( difficulty.selectedOption );
			passCode.maxLength = int.Parse ( difficulty.selectedOption ) + 2;
		}
	
		if ( passCode.text.Length < terminal.difficulty + 2 ) {
			var addDigits : int = ( terminal.difficulty + 2 ) - passCode.text.Length;
			
			for ( var i = 0; i < addDigits; i++ ) {
				passCode.text += "0";
			}
		}
		
		terminal.passCode = passCode.text;
																				
		for ( i = 0; i < 3; i++ ) { 
			if ( buttons[i].hiddenString != "" ) {
				terminal.cameraGUIDs[i] = buttons[i].hiddenString;
			}
		}
	}
	
	function Update () {
		UpdateObject ();
	}
	
	public function PickCamera ( n : String ) {
		var i : int = int.Parse ( n );
	
		EditorCore.pickerType = SurveillanceCamera;
		EditorCore.pickerCallback = function ( name : String, id : String ) {
			buttons[i].text = name;
			buttons[i].hiddenString = id;
		
			UpdateObject ();
		};
		
		EditorCore.SetPickMode ( true );
	}
}