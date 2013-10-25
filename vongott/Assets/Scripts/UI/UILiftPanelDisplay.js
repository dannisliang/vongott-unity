#pragma strict

class UILiftPanelDisplay extends OGPage {
	public static var currentLiftPanel : LiftPanel;
	public static var callback : Function;
	
	public var buttonContainer : Transform;
		
	public function PressDigit ( n : String ) {	
		var i : int = int.Parse ( n );
		
		callback ( i );
	}
	
	override function StartPage () {
		for ( var i : int = 0; i < buttonContainer.childCount; i++ ) {
			var n : int = int.Parse ( buttonContainer.GetChild(i).GetComponent(OGButton).text );
			
			buttonContainer.GetChild(i).gameObject.SetActive ( n-1 < currentLiftPanel.allDestinations.Count );
		}
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
		currentLiftPanel = null;
		callback = null;
	}
}