#pragma strict

public class OFDeserializer {
	private static function ParseEnum ( e : System.Type, s : String ) : int {
		var strings : String[] = System.Enum.GetNames ( e );
		
		for ( var i : int = 0; i < strings.Length; i++ ) {
			if ( strings[i] == s ) {
				return i;
			}
		}

		return -1;
	}

	public static function CheckComponent ( obj : OFSerializedObject, type : System.Type ) : Component {
		var component = obj.gameObject.GetComponent ( type );
		
		if ( !component ) {
			component = obj.gameObject.AddComponent ( type );
		}

		return component;
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
		
		var components : JSONObject = input.GetField ( "components" );
		output.gameObject.name = input.GetField ( "name" ).str;
		output.id = input.GetField ( "id" ).str;

		for ( var i : int = 0; i < components.list.Count; i++ ) {
			var c : Component;
			
			switch ( components.list[i].GetField ( "_TYPE_" ).str ) {
				case "Transform":
					Deserialize ( components.list[i], output.gameObject.transform );
					break;

				case "OCTree":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( OCTree ) ) as OCTree );
					break;
				
				case "OSInventory":
					Deserialize ( components.list[i], CheckComponent ( output, typeof ( OSInventory ) ) as OSInventory );
					break;
			}


		}

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

	// Transform
	public static function Deserialize ( input : JSONObject, transform : Transform ) {
		transform.eulerAngles = DeserializeVector3 ( input.GetField ( "eulerAngles" ) );
		transform.position = DeserializeVector3 ( input.GetField ( "position" ) );
		transform.localScale = DeserializeVector3 ( input.GetField ( "localScale" ) );
	}

	// OCTree
	public static function Deserialize ( input : JSONObject, tree : OCTree ) {
		var rootNodes : List.< OCRootNode > = new List.< OCRootNode > ();
		var speakers : List.< OCSpeaker > = new List.< OCSpeaker > ();

		for ( var speaker : JSONObject in input.GetField ( "speakers" ).list ) {
			var s : OCSpeaker = new OCSpeaker ();
			s.id = speaker.GetField ( "id" ).str;
			speakers.Add ( s );
		}

		for ( var root : JSONObject in input.GetField ( "rootNodes" ).list ) {
			var r : OCRootNode = new OCRootNode ();
			var tags : List.< String > = new List.< String >();

			for ( var tag : JSONObject in root.GetField ( "tags" ).list ) {
				tags.Add ( tag.str );
			}

			var nodes : List.< OCNode > = new List.< OCNode > ();

			for ( var node : JSONObject in root.GetField ( "nodes" ).list ) {
				var n : OCNode = new OCNode ();
				var connectedTo : List.< int > = new List.< int > ();

				for ( var c : JSONObject in node.GetField ( "connectedTo" ).list ) {
					connectedTo.Add ( c.n );
				}

				n.id = node.GetField ( "id" ).n;
				n.type = ParseEnum ( typeof ( OCNodeType ), node.GetField ( "type" ).str );
				n.connectedTo = connectedTo.ToArray ();

				switch ( n.type ) {
					case OCNodeType.Speak:
						var speak : OCSpeak = new OCSpeak ();
						var lines : List.< String > = new List.< String > ();

						for ( var l : JSONObject in node.GetField ( "speak" ).GetField ( "lines" ).list ) {
							lines.Add ( l.str );
						}

						speak.speaker = node.GetField ( "speak" ).GetField ( "speaker" ).n;
						speak.lines = lines.ToArray ();
						
						n.speak = speak;

						break;

					case OCNodeType.Event:
						var event : OCEvent = new OCEvent ();

						event.message = node.GetField ( "event" ).GetField ( "message" ).str;
						event.argument = node.GetField ( "event" ).GetField ( "argument" ).str;

						n.event = event;

						break;

					case OCNodeType.Jump:
						var jump : OCJump = new OCJump ();
				
						jump.rootNode = node.GetField ( "jump" ).GetField ( "rootNode" ).n;

						n.jump = jump;

						break;

					case OCNodeType.SetFlag:
						var setFlag : OCSetFlag = new OCSetFlag ();

						setFlag.flag = node.GetField ( "setFlag" ).GetField ( "flag" ).str;
						setFlag.b = node.GetField ( "setFlag" ).GetField ( "b" ).b;

						n.setFlag = setFlag;

						break;
					
					case OCNodeType.GetFlag:
						var getFlag : OCGetFlag = new OCGetFlag ();

						getFlag.flag = node.GetField ( "getFlag" ).GetField ( "flag" ).str;

						n.getFlag = getFlag;

						break;

					case OCNodeType.End:
						var end : OCEnd = new OCEnd ();
				
						end.rootNode = node.GetField ( "end" ).GetField ( "rootNode" ).n;

						n.end = end;

						break;
				}

				nodes.Add ( n );
			}

			r.firstNode = root.GetField ( "firstNode" ).n;
			r.tags = tags.ToArray ();
			r.nodes = nodes.ToArray ();

			rootNodes.Add ( r );
		}

		tree.speakers = speakers.ToArray ();
		tree.rootNodes = rootNodes.ToArray ();
		tree.currentRoot = input.GetField ( "currentRoot" ).n;
	}

	// OSInventory
	public static function Deserialize ( input : JSONObject, inventory : OSInventory ) {
		var slots : List.< OSSlot > = new List.< OSSlot > ();

		for ( var slot : JSONObject in input.GetField ( "slots" ).list ) {
			var s : OSSlot = new OSSlot ();
			var i : OSItem = Resources.Load ( slot.GetField ( "item" ).GetField ( "prefabPath" ).str ) as OSItem;
		
			i.ammunition.value = slot.GetField ( "item" ).GetField ( "ammunition" ).n;

			s.item = i;
			s.x = slot.GetField ( "x" ).n;
			s.y = slot.GetField ( "y" ).n;
			s.quantity = slot.GetField ( "quantity" ).n;
			s.equipped = slot.GetField ( "equipped" ).b;

			slots.Add ( s );
		}
		
		var quickSlots : List.< int > = new List.< int > ();

		for ( var quickSlot : JSONObject in input.GetField ( "quickSlots" ).list ) {
			quickSlots.Add ( quickSlot.n );
		}

		var grid : OSGrid = new OSGrid ( inventory );

		grid.width = input.GetField ( "width" ).n;
		grid.height = input.GetField ( "height" ).n;

		var wallet : List.< OSCurrencyAmount > = new List.< OSCurrencyAmount > ();

		for ( var currency : JSONObject in input.GetField ( "wallet " ).list ) {
			var c : OSCurrencyAmount = new OSCurrencyAmount ( currency.GetField ( "index" ).n );

			c.amount = currency.GetField ( "amount" ).n;

			wallet.Add ( c );
		}

		inventory.definitions = Resources.Load ( input.GetField ( "definitions" ).str ) as OSDefinitions;
		inventory.slots = slots;
		inventory.quickSlots = quickSlots;
		inventory.grid = grid;
		inventory.wallet = wallet.ToArray ();
	}


	/////////////////
	// Structs
	/////////////////
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
