#pragma strict

class EditorInspectorKeypad extends MonoBehaviour {
	public var button : OGButton;
	public var passCode : OGTextField;
	public var difficulty : OGPopUp;
	
	private var keypad : Keypad;
	
	public function Init ( obj : GameObject ) {
		keypad = obj.GetComponent( Keypad );
		
		if ( keypad.doorGUID != "" ) {
			button.hiddenString = keypad.doorGUID;
			button.text = "Door";
		}
		
		passCode.text = keypad.passCode;
		
		difficulty.selectedOption = keypad.difficulty.ToString();
	}

	public function UpdateObject () {
		if ( !keypad ) { return; }
		
		if ( difficulty.selectedOption != "<level>" && difficulty.selectedOption != "" ) {
			keypad.difficulty = int.Parse ( difficulty.selectedOption );
			passCode.maxLength = keypad.difficulty + 2;
		}
	
		if ( passCode.text.Length < keypad.difficulty + 2 ) {
			var addDigits : int = ( keypad.difficulty + 2 ) - passCode.text.Length;
			
			for ( var i = 0; i < addDigits; i++ ) {
				passCode.text += "0";
			}
		}
		
		keypad.passCode = passCode.text;
																				
		if ( button.hiddenString != "" ) {
			keypad.doorGUID = button.hiddenString;
		}
	}
	
	function Update () {
		UpdateObject ();
	}
	
	public function PickDoor () {	
		EditorCore.pickerType = Door;
		EditorCore.pickerCallback = function ( name : String, id : String ) {
			button.text = name;
			button.hiddenString = id;
		
			UpdateObject ();
		};
		
		EditorCore.SetPickMode ( true );
	}
}