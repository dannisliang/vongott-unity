#pragma strict

class UIKeypadDisplay extends OGPage {
	public static var passCode : String = "";
	public static var successCallback : Function = null;
	
	public var digitDisplay : OGLabel;
	
	private var suspended : boolean = false;
	
	private function Failed () : IEnumerator {
		suspended = true;
			
		digitDisplay.text = "INCORRECT";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "INCORRECT";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "INCORRECT";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "";
	
		suspended = false;
	}
	
	private function Success () : IEnumerator {
		suspended = true;
		
		digitDisplay.text = "SUCCESS";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "SUCCESS";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "SUCCESS";
		yield WaitForSeconds ( 0.2 );
		digitDisplay.text = "";
		
		suspended = false;
		
		successCallback ();
		successCallback = null;
	}
	
	public function PressDigit ( n : String ) {
		if ( suspended ) { return; }
		
		digitDisplay.text += n;
		
		if ( digitDisplay.text.Length >= passCode.Length ) {
			if ( digitDisplay.text == passCode ) {
				if ( successCallback ) {
					StartCoroutine ( Success () );
				} else {
					digitDisplay.text = "NO CALLBACK FUNCTION!";
				}
			
			} else {
				StartCoroutine ( Failed() );
			
			}
		}
	}
	
	override function StartPage () {
	
	}
	
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.Keypad0 ) ) { PressDigit ( "0" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad1 ) ) { PressDigit ( "1" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad2 ) ) { PressDigit ( "2" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad3 ) ) { PressDigit ( "3" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad4 ) ) { PressDigit ( "4" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad5 ) ) { PressDigit ( "5" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad6 ) ) { PressDigit ( "6" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad7 ) ) { PressDigit ( "7" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad8 ) ) { PressDigit ( "8" ); }
		else if ( Input.GetKeyDown ( KeyCode.Keypad9 ) ) { PressDigit ( "9" ); }
	}

	override function ExitPage () {
		digitDisplay.text = "";
		suspended = false;
	}
}