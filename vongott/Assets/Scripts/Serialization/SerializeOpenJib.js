#pragma strict

public class SerializeOpenJib extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( OJSequence ) ];
	}

	private function Serialize ( input : OJKeyframe ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

		var event : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		event.AddField ( "message", input.event.message );
		event.AddField ( "argument", input.event.argument );
		
		var curve : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		curve.AddField ( "symmetrical", input.curve.symmetrical );
		curve.AddField ( "before", OFSerializer.Serialize ( input.curve.before ) );
		curve.AddField ( "after", OFSerializer.Serialize ( input.curve.after ) );
		
		output.AddField ( "time", input.time );
		output.AddField ( "stop", input.stop );
		output.AddField ( "event", event );
		output.AddField ( "position", OFSerializer.Serialize ( input.position ) );
		output.AddField ( "rotation", OFSerializer.Serialize ( input.rotation ) );
		output.AddField ( "curve", curve );
		output.AddField ( "fov", input.fov );
		output.AddField ( "brightness", input.brightness );

		return output;
	}

	override function Serialize ( component : Component ) : JSONObject {
		var input : OJSequence = component as OJSequence;
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		
		var keyframes : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var kf : OJKeyframe in input.keyframes ) {
			keyframes.Add ( Serialize ( kf ) );
		}

		output.AddField ( "autoPlay", input.autoPlay );
		output.AddField ( "rotateAlongCurve", input.rotateAlongCurve );
		output.AddField ( "keyframes", keyframes );
		output.AddField ( "length", input.length );

		return output;
	}
	
	private function Deserialize ( input : JSONObject ) : OJKeyframe {
		var output : OJKeyframe = new OJKeyframe ();

		output.event.message = input.GetField ( "event" ).GetField ( "message" ).str;
		output.event.argument = input.GetField ( "event" ).GetField ( "argument" ).str;
		
		output.curve.symmetrical = input.GetField ( "curve" ).GetField ( "symmetrical" ).b;
		output.curve.before = OFDeserializer.DeserializeVector3 ( input.GetField ( "curve" ).GetField ( "before" ) );
		output.curve.after = OFDeserializer.DeserializeVector3 ( input.GetField ( "curve" ).GetField ( "after" ) );
		
		output.time = input.GetField ( "time" ).n;
		output.stop = input.GetField ( "stop" ).b;
		output.position = OFDeserializer.DeserializeVector3 ( input.GetField ( "position" ) );
		output.rotation = OFDeserializer.DeserializeVector3 ( input.GetField ( "rotation" ) );
		output.fov = input.GetField ( "fov" ).n;
		output.brightness = input.GetField ( "brightness" ).n;

		return output;
	}
	override function Deserialize ( input : JSONObject, component : Component ) {
		var output : OJSequence = component as OJSequence;

		for ( var kf : JSONObject in input.GetField ( "keyframes" ).list ) {
			output.keyframes.Add ( Deserialize ( kf ) );
		}

		output.autoPlay = input.GetField ( "autoPlay" ).b;
		output.rotateAlongCurve = input.GetField ( "rotateAlongCurve" ).b;
		output.length = input.GetField ( "length" ).n;
	}
}
