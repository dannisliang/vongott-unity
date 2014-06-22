#pragma strict

public class SerializeOpenConvo extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( OCTree ) ];
	}

	override function Serialize ( component : Component ) : JSONObject {
		var input : OCTree = component as OCTree;

		if ( !input ) { return null; }
		
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var rootNodes : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
		var speakers : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var speaker : String in input.speakers ) {
			speakers.Add ( speaker );
		}

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

						for ( var l : int = 0; l < node.speak.lines.Length; l++ ) {
							var line : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

							line.AddField ( "text", node.speak.lines[l].text.Replace ( "\"", "\\\"" ) );
							line.AddField ( "audio", node.id + ">" + l );
							line.AddField ( "animation", node.speak.lines[l].animation );
							
							lines.Add ( line );
						}
						
						speak.AddField ( "speaker", node.speak.speaker );
						speak.AddField ( "lines", lines );

						n.AddField ( "speak", speak );
						
						break;

					case OCNodeType.Event:
						var event : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

						event.AddField ( "message", node.event.message );
						event.AddField ( "argument", node.event.argument );
						event.AddField ( "eventToTarget", node.event.eventToTarget );
						
						var so : OFSerializedObject;
						
						if ( !String.IsNullOrEmpty ( node.event.objectId ) ) {
							event.AddField ( "objectId", node.event.objectId );
						
						} else if ( !String.IsNullOrEmpty ( node.event.objectPath ) ) {
							event.AddField ( "objectPath", node.event.objectPath );

						} else if ( node.event.object ) {
							so = node.event.object.GetComponent.< OFSerializedObject > ();
							
							if ( so ) {
								if ( so.gameObject.activeInHierarchy ) {
									event.AddField ( "objectId", so.id );
								
								} else {
									event.AddField ( "objectPath", so.prefabPath );
								}
							}
						}

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
		output.AddField ( "speakers", speakers );
		output.AddField ( "currentRoot", input.currentRoot );

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var tree : OCTree = component as OCTree;
		var i : int = 0;
		var i1 : int = 0;

		if ( !tree && !input ) { return; }
	
		var manager : OCManager = OCManager.GetInstance();

		if ( manager ) {
			manager.flags.Clear ();
		}

		var rootNodes : List.< OCRootNode > = new List.< OCRootNode > ();
		var speakers : List.< String > = new List.< String > ();

		for ( i = 0; i < input.GetField ( "speakers" ).list.Count; i++ ) {
			speakers.Add ( input.GetField ( "speakers" ).list[i].str );
		}

		for ( i = 0; i < input.GetField ( "rootNodes" ).list.Count; i++ ) {
			var root : JSONObject = input.GetField ( "rootNodes" ).list[i];
			var r : OCRootNode = new OCRootNode ();
			var tags : List.< String > = new List.< String >();

			for ( var tag : JSONObject in root.GetField ( "tags" ).list ) {
				tags.Add ( tag.str );
			}

			var nodes : List.< OCNode > = new List.< OCNode > ();

			for ( i1 = 0; i1 < root.GetField ( "nodes" ).list.Count; i1++ ) {
				var node : JSONObject = root.GetField ( "nodes" ).list[i1];
				var n : OCNode = new OCNode ();
				var connectedTo : List.< int > = new List.< int > ();

				for ( var c : JSONObject in node.GetField ( "connectedTo" ).list ) {
					connectedTo.Add ( c.n );
				}

				n.id = node.GetField ( "id" ).n;
				n.type = OFDeserializer.ParseEnum ( typeof ( OCNodeType ), node.GetField ( "type" ).str );
				n.connectedTo = connectedTo.ToArray ();

				switch ( n.type ) {
					case OCNodeType.Speak:
						var speak : OCSpeak = new OCSpeak ();
						var lines : List.< OCSpeak.Line > = new List.< OCSpeak.Line > ();

						var linesJSON : List.< JSONObject > = node.GetField ( "speak" ).GetField ( "lines" ).list;

						for ( var l : int = 0; l < linesJSON.Count; l++ ) {
							var assetLink : OFAssetLink = tree.GetComponent.< OFSerializedObject > ().GetAssetLink ( n.id + ">" + l );
						
							lines.Add ( new OCSpeak.Line ( linesJSON[l].GetField ( "text" ).str.Replace ( "\\\"", "\"" ), assetLink == null ? null : assetLink.GetAudioClip (), linesJSON[l].GetField ( "animation" ).str ) );
						}

						speak.speaker = node.GetField ( "speak" ).GetField ( "speaker" ).n;
						speak.lines = lines.ToArray ();
						
						n.speak = speak;

						break;

					case OCNodeType.Event:
						var event : OCEvent = new OCEvent ();

						event.message = node.GetField ( "event" ).GetField ( "message" ).str;
						event.argument = node.GetField ( "event" ).GetField ( "argument" ).str;
						event.eventToTarget = node.GetField ( "event" ).GetField ( "eventToTarget" ).b;
						
						if ( node.GetField ( "event" ).HasField ( "objectPath" ) ) {
							event.objectPath = node.GetField ( "event" ).GetField ( "objectPath" ).str;
							event.object = Resources.Load ( event.objectPath ) as GameObject;
							
						} else if ( node.GetField ( "event" ).HasField ( "objectId" ) ) {
							event.objectId = node.GetField ( "event" ).GetField ( "objectId" ).str;
							OFDeserializer.planner.DeferConnection ( function ( so : OFSerializedObject, indices : int [] ) {
								tree.rootNodes [ indices[0] ].nodes [ indices[1] ].event.object = so.gameObject;
							}, event.objectId, [ i, i1 ] );
						}

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

						if ( manager ) {
							manager.flags.Set ( setFlag.flag, false );
						}

						break;
					
					case OCNodeType.GetFlag:
						var getFlag : OCGetFlag = new OCGetFlag ();

						getFlag.flag = node.GetField ( "getFlag" ).GetField ( "flag" ).str;

						n.getFlag = getFlag;
						
						if ( manager ) {
							manager.flags.Set ( getFlag.flag, false );
						}

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
}
