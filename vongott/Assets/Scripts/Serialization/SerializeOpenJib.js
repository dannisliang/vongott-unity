#pragma strict

public class SerializeOpenJib extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( OJSequence ) ];
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var input : OJSequence = component as OJSequence;

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var sequence : OJSequence = component as OJSequence;
	}
}
