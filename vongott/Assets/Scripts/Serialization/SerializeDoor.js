#pragma strict

public class SerializeDoor extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( Door ) ];
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var input : Door = component as Door;

		output.AddField ( "locked", input.locked );
		output.AddField ( "closed", input.closed );
		output.AddField ( "keyId", input.keyId );
		output.AddField ( "lockLevel", input.lockLevel );

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var door : Door = component as Door;
		
		door.locked = input.GetField ( "locked" ).b;
		door.closed = input.GetField ( "closed" ).b;
		door.keyId = input.GetField ( "keyId" ).str;
		door.lockLevel = input.GetField ( "lockLevel" ).n;
	}
}
