#pragma strict

public class SerializeInputManager extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( InputManager ) ];
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var input : InputManager = component as InputManager;
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var buttons : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var b : InputManager.Button in input.buttons ) {
			var button : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
			var axis : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

			axis.AddField ( "negative", b.axis.negative );
			axis.AddField ( "positive", b.axis.positive );

			button.AddField ( "name", b.name );
			button.AddField ( "key", b.key );
			button.AddField ( "mouse", b.mouse );
			button.AddField ( "axis", axis );

			buttons.Add ( button );
		}

		output.AddField ( "buttons", buttons );

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var output : InputManager = component as InputManager;
		var buttons : List.< InputManager.Button > = new List.< InputManager.Button > ();

		for ( var b : JSONObject in input.GetField ( "buttons" ).list ) {
			var button : InputManager.Button = new InputManager.Button ();
			var axis : InputManager.Axis = new InputManager.Axis ();

			axis.negative = parseInt ( b.GetField ( "axis" ).GetField ( "negative" ).n );
			axis.positive = parseInt ( b.GetField ( "axis" ).GetField ( "positive" ).n );

			button.name = b.GetField ( "name" ).str;
			button.key = parseInt ( b.GetField ( "key" ).n );
			button.mouse = b.GetField ( "mouse" ).n;
			button.axis = axis;

			buttons.Add ( button );
		}

		output.buttons = buttons.ToArray ();
	}
}
