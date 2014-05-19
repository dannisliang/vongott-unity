#pragma strict

public class KeypadInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( Keypad ); }
	
	override function Inspector () {
		var keypad : Keypad = target.GetComponent.< Keypad > ();

		keypad.difficulty = Slider ( "Difficulty", keypad.difficulty, 0, 9 );
		keypad.passCode = TextField ( "Passcode", keypad.passCode );
		
		var go : GameObject;
		
		if ( keypad.door ) {
			go = keypad.door.gameObject;
		}
			
		go = ObjectField ( "Door", go, typeof ( Door ), OEObjectField.Target.Scene ) as GameObject;

		if ( go ) {
			keypad.door = go.GetComponent.< Door > ();
		}

		var passCode : int = 0;

		int.TryParse ( keypad.passCode, passCode );

		keypad.passCode = passCode.ToString ();
	}
}
