#pragma strict

public class OFDeserializer {
	private class QueueItem {
		public var id : String;
		public var f : Function;
		public var i : int = -1;
		
		function QueueItem ( f : Function, id : String, i : int ) {
			this.f = f;
			this.id = id;
			this.i = i;
		}
	}

	private static var connectQueue : List.< QueueItem > = new List.< QueueItem > ();
	private static var spawnedObjects : List.< OFSerializedObject > = new List.< OFSerializedObject > ();
	private static var plugins : OFPlugin[];
	
	public static function DeferConnection ( f : Function, id : String, i : int ) {
		connectQueue.Add ( new QueueItem ( f, id, i ) );
	}

	public static function DeferConnection ( f : Function, id : String ) {
		connectQueue.Add ( new QueueItem ( f, id, -1 ) );
	}

	public static function FindObject ( id : String ) : OFSerializedObject {
		for ( var i : int = 0; i < spawnedObjects.Count; i++ ) {
			if ( spawnedObjects[i].id == id ) {
				return spawnedObjects[i];
			}
		}

		return null;
	}
	
	private static function ConnectAll () {
		for ( var i : int = 0; i < connectQueue.Count; i++ ) {
			if ( connectQueue[i].i >= 0 ) {
				connectQueue[i].f ( FindObject ( connectQueue[i].id ), connectQueue[i].i );
			} else {
				connectQueue[i].f ( FindObject ( connectQueue[i].id ) );
			}
		}

		connectQueue.Clear ();
		spawnedObjects.Clear ();
	}

	public static function ParseEnum ( e : System.Type, s : String ) : int {
		var strings : String[] = System.Enum.GetNames ( e );
		
		for ( var i : int = 0; i < strings.Length; i++ ) {
			if ( strings[i] == s ) {
				return i;
			}
		}

		return -1;
	}

	public static function CheckComponent ( obj : OFSerializedObject, type : System.Type ) : Component {
		return CheckComponent ( obj, type, false );
	}

	public static function CheckComponent ( obj : OFSerializedObject, type : System.Type, forceAdd : boolean ) : Component {
		var component = obj.gameObject.GetComponent ( type );
		
		if ( !component ) {
			component = obj.gameObject.AddComponent ( type );
			forceAdd = true;
		}

		if ( forceAdd ) {
			obj.SetField ( type.ToString().Replace ( "UnityEngine.", "" ), component );
		}

		return component;
	}
	
	public static function DeserializeChildren ( input : JSONObject, parent : Transform ) {
		for ( var i : int = 0; i < input.list.Count; i++ ) {
			var p : JSONObject = input.list[i];
			var k : String = input.keys[i];
			var t : Transform;
		       	var go : GameObject = parent.gameObject.Find ( k );
		
			if ( go ) {
				t = go.transform;
			}

			if ( !t ) {
				t = new GameObject ( k ).transform;
				t.parent = parent;
				t.position = Vector3.zero;
			}

			Debug.Log ( "this", t );

			for ( var json : JSONObject in p.list ) {
				var so : OFSerializedObject = Deserialize ( json );
				
				if ( so ) {
					so.transform.parent = t;
				}
			}
		}

		ConnectAll ();
	}
	
	// This creates a new GameObject
	public static function Deserialize ( input : JSONObject ) : OFSerializedObject {
		var so : OFSerializedObject;
		
		return Deserialize ( input, so );
	}	
	
	// This applies the deserialized values to an existing GameObject
	public static function Deserialize ( input : JSONObject, output : OFSerializedObject ) : OFSerializedObject {
		if ( !output ) {
			if ( input.HasField ( "prefabPath" ) && !String.IsNullOrEmpty ( input.GetField ( "prefabPath" ).str ) ) {	
				var newGO : GameObject = MonoBehaviour.Instantiate ( Resources.Load ( input.GetField ( "prefabPath" ).str ) ) as GameObject;
				output = newGO.GetComponent.< OFSerializedObject > ();
			
			} else {
				output = new GameObject ().AddComponent.< OFSerializedObject > ();
			
			}
		}
		
		if ( !plugins ) {
			plugins = OFReflector.GetPlugins ();
		}
		
		var components : JSONObject = input.GetField ( "components" );
		output.gameObject.name = input.GetField ( "name" ).str;
		output.id = input.GetField ( "id" ).str;

		for ( var i : int = 0; i < components.list.Count; i++ ) {
			var c : Component;
			var typeString : String = components.list[i].GetField ( "_TYPE_" ).str;

			// Unity classes	
			switch ( typeString ) {
				case "Light":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( Light ) ) as Light );
					break;
				
				case "Transform":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( Transform ), true ) as Transform );
					break;
			}

			// Plugins
	       		for ( var p : int = 0; p < plugins.Length; p++ ) {
				var type : System.Type = System.Type.GetType ( typeString ); 

				if ( type != null && plugins[p].CheckType ( type ) ) {
					plugins[p].Deserialize ( components.list[i], CheckComponent ( output, type ) );
				}
			}

		}

		spawnedObjects.Add ( output );

		return output;
	}


	//////////////////
	// Classes
	//////////////////
	// Component
	public static function Deserialize ( input : JSONObject, component : Component ) {
		if ( component.GetType() == typeof ( Transform ) ) {
			Deserialize ( input, component as Transform );
		
		}
	}
	
	// Light
	public static function Deserialize ( input : JSONObject, light : Light ) {
		light.type = ParseEnum ( typeof ( LightType ), input.GetField ( "type" ).str );
		light.range = input.GetField ( "range" ).n;
		light.color = DeserializeColor ( input.GetField ( "color" ) );
		light.intensity = input.GetField ( "intensity" ).n;
		light.shadows = ParseEnum ( typeof ( LightShadows ), input.GetField ( "shadows" ).str );
	}

	// Transform
	public static function Deserialize ( input : JSONObject, transform : Transform ) {
		transform.eulerAngles = DeserializeVector3 ( input.GetField ( "eulerAngles" ) );
		transform.position = DeserializeVector3 ( input.GetField ( "position" ) );
		transform.localScale = DeserializeVector3 ( input.GetField ( "localScale" ) );
	}


	/////////////////
	// Structs
	/////////////////
	// Color
	public static function DeserializeColor ( input : JSONObject ) : Color {
		var output : Color = new Color ();

		output.r = input.GetField ( "r" ).n;
		output.g = input.GetField ( "g" ).n;
		output.b = input.GetField ( "b" ).n;
		output.a = input.GetField ( "a" ).n;

		return output;
	}
	
	// Vector3
	public static function DeserializeVector3 ( input : JSONObject ) : Vector3 {
		var output : Vector3 = new Vector3();

		output.x = input.GetField ( "x" ).n;
		output.y = input.GetField ( "y" ).n;
		output.z = input.GetField ( "z" ).n;

		return output;
	}
	
	// Vector2
	public static function DeserializeVector2 ( input : JSONObject ) : Vector2 {
		var output : Vector2 = new Vector2();

		output.x = input.GetField ( "x" ).n;
		output.y = input.GetField ( "y" ).n;

		return output;
	}
}
