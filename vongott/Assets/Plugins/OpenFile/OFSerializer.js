#pragma strict

public class OFSerializer {
	public static function CanSerialize ( type : System.Type ) : boolean {
		return CanSerialize ( type.ToString () );
	}

	public static function CanSerialize ( type : String ) : boolean {
		var str : String = type;
		str = str.Replace ( "UnityEngine.", "" );
		var strings : String[] = System.Enum.GetNames ( OFFieldType );

		for ( var i : int = 0; i < strings.Length; i++ ) {
			if ( strings[i] == str ) {
				return true;
			}
		}

		return false;
	}
	
	public static function Serialize ( input : OFSerializedObject ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var components : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		output.AddField ( "name", input.gameObject.name );
		output.AddField ( "id", input.id );
	        output.AddField ( "prefabPath", input.prefabPath );	

		for ( var i : int = 0; i < input.fields.Length; i++ ) {
			var c : Component = input.fields[i].component;

			if ( c ) {
				components.Add ( SerializeComponent ( c ) );
			}
		}

		output.AddField ( "components", components );

		return output;
	}


	//////////////////
	// Classes
	//////////////////
	// Component
	public static function SerializeComponent ( input : Component ) : JSONObject {
		var output : JSONObject;
	
		if ( input.GetType() == typeof ( Transform ) ) {
			output = SerializeTransform ( input as Transform );
		
		} else if ( input.GetType() == typeof ( OCTree ) ) {
			output = SerializeOCTree ( input as OCTree );
		
		} else if ( input.GetType() == typeof ( OSInventory ) ) {
			output = SerializeOSInventory ( input as OSInventory );
		
		}

		if ( output != null ) {
			output.AddField ( "_TYPE_", input.GetType().ToString().Replace ( "UnityEngine.", "" ) );
		}

		return output;
	}

	// Transform
	public static function SerializeTransform ( input : Transform ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

		output.AddField ( "eulerAngles", SerializeVector3 ( input.eulerAngles ) );
		output.AddField ( "position", SerializeVector3 ( input.position ) );
		output.AddField ( "localScale", SerializeVector3 ( input.localScale ) );
	
		return output;
	}

	// OCTree
	public static function SerializeOCTree ( input : OCTree ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var rootNodes : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var root : OCRootNode in input.rootNodes ) {
			var r : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
			var tags : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

			for ( var tag : String in root.tags ) {
				tags.Add ( tag );
			}
			
			var nodes : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
			
			for ( var node : OCNode in root.nodes ) {
				var n : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
				var connectedTo : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

				for ( var c : int in node.connectedTo ) {
					connectedTo.Add ( c );
				}

				n.AddField ( "id", node.id );
				n.AddField ( "type", node.type.ToString() );
				n.AddField ( "connectedTo", connectedTo );

				switch ( node.type ) {
					case OCNodeType.Speak:
						var speak : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
						var lines : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

						for ( var l : String in node.speak.lines ) {
							lines.Add ( l );
						}

						speak.AddField ( "speaker", node.speak.speaker );
						speak.AddField ( "lines", lines );

						n.AddField ( "speak", speak );
						
						break;

					case OCNodeType.Event:
						var event : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

						event.AddField ( "message", node.event.message );
						event.AddField ( "argument", node.event.argument );

						n.AddField ( "event", event );

						break;

					case OCNodeType.Jump:
						var jump : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

						jump.AddField ( "rootNode", node.jump.rootNode );

						n.AddField ( "jump", jump );

						break;

					case OCNodeType.SetFlag:
						var setFlag : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
						
						setFlag.AddField ( "flag", node.setFlag.flag );
						setFlag.AddField ( "b", node.setFlag.b );

						n.AddField ( "setFlag", setFlag );
						
						break;

					case OCNodeType.GetFlag:
						var getFlag : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
						
						getFlag.AddField ( "flag", node.getFlag.flag );

						n.AddField ( "getFlag", getFlag );
						
						break;

					case OCNodeType.End:
						var end : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

						end.AddField ( "rootNode", node.end.rootNode );

						n.AddField ( "end", end );
						
						break;

				}

				nodes.Add ( n );
			}

			r.AddField ( "firstNode", root.firstNode );
			r.AddField ( "tags", tags );
			r.AddField ( "nodes", nodes );

			rootNodes.Add ( r );
		}

		output.AddField ( "rootNodes", rootNodes );
		output.AddField ( "currentRoot", input.currentRoot );

		return output;
	}

	// OSInventory
	public static function SerializeOSInventory ( input : OSInventory ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var slots : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var slot : OSSlot in input.slots ) {
			var s : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
			var i : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

			i.AddField ( "prefabPath", slot.item.prefabPath );
			i.AddField ( "ammunition", slot.item.ammunition.value );

			s.AddField ( "item", i );
			s.AddField ( "x", slot.x );
			s.AddField ( "y", slot.y );
			s.AddField ( "quantity", slot.quantity );
			s.AddField ( "equipped", slot.equipped );
			
			slots.Add ( s );
		}

		var quickSlots : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var quickSlot : int in input.quickSlots ) {
			quickSlots.Add ( quickSlot );
		}

		var grid : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

		grid.AddField ( "width", input.grid.width );
		grid.AddField ( "height", input.grid.height );

		var wallet : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var currency : OSCurrencyAmount in input.wallet ) {
			var c : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
			
			c.AddField ( "index", currency.index );
			c.AddField ( "amount", currency.amount );

			wallet.Add ( c );
		}

		output.AddField ( "definitions", input.definitions.prefabPath );
		output.AddField ( "slots", slots );
		output.AddField ( "quickSlots", quickSlots );
		output.AddField ( "grid", grid );
		output.AddField ( "wallet", wallet );

		return output;
	}

	/////////////////
	// Structs
	/////////////////
	// Vector3
	public static function SerializeVector3 ( input : Vector3 ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

		output.AddField ( "x", input.x );
		output.AddField ( "y", input.y );
		output.AddField ( "z", input.z );

		return output;
	}
	
	// Vector2
	public static function SerializeVector2 ( input : Vector2 ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

		output.AddField ( "x", input.x );
		output.AddField ( "y", input.y );

		return output;
	}
}
