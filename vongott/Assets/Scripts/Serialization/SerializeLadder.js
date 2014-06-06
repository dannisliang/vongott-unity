#pragma strict

public class SerializeLadder extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( Ladder ) ];
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var input : Ladder = component as Ladder;

		output.AddField ( "segments", input.segments );

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var ladder : Ladder = component as Ladder;
		
		ladder.segments = input.GetField ( "segments" ).n;
	}
}
