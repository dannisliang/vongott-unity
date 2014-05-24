#pragma strict

public class SerializeKeypad extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( Keypad ) ];
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var input : Computer = component as Computer;
	
		output.AddField ( "domain", input.domain );

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var computer : Computer = component as Computer;
	
//		computer.domain = input.GetField ( "domain" ).str;
	}
}
