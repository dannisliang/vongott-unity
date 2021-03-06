﻿#pragma strict

public class SerializeKeypad extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( Keypad ) ];
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var input : Keypad = component as Keypad;
	
		output.AddField ( "passCode", input.passCode );
		output.AddField ( "difficulty", input.difficulty );
		
		if ( input.door ) {
			output.AddField ( "door", input.door.GetComponent.< OFSerializedObject > ().id );
		}

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var keypad : Keypad = component as Keypad;
		
		keypad.passCode = input.GetField ( "passCode" ).str;
		keypad.difficulty = input.GetField ( "difficulty" ).n;
	
		if ( input.HasField ( "door" ) ) {
			OFDeserializer.planner.DeferConnection ( function ( so : OFSerializedObject ) {
				keypad.door = so.GetComponent.< Door > ();
			}, input.GetField ( "door" ).str );
		}
	}
}
