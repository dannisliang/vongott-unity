#pragma strict

public class SerializeOpenAcumen extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( OACharacter ), typeof ( OATrigger ) ];
	}
	
	private function SerializeCharacter ( input : OACharacter ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
	
		var behaviour : int = input.behaviour;
		output.AddField ( "behaviour", behaviour );
		output.AddField ( "attackTarget", input.attackTarget );
		output.AddField ( "unconcious", input.unconcious );

		// Inventory
		output.AddField ( "usingWeapons", input.usingWeapons );
		output.AddField ( "weaponCategoryPreference", input.weaponCategoryPreference );
		output.AddField ( "weaponSubcategoryPreference", input.weaponSubcategoryPreference );

		// Conversation
		output.AddField ( "conversationTreePath", input.conversationTreePath.Replace ( "\\", "/" ).Replace ( Application.dataPath, "" ) );

		var speakerObjects : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var i : int = 0; i < input.convoSpeakerObjects.Length; i++ ) {
			if ( input.convoSpeakerObjects[i] != null ) {
				speakerObjects.Add ( input.convoSpeakerObjects[i].GetComponent.< OFSerializedObject > ().id );
			} else {
				speakerObjects.Add ( "null" );
			}
		}	

		output.AddField ( "convoSpeakerObjects", speakerObjects );

		var pathGoals : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
		
		for ( i = 0; i < input.pathGoals.Length; i++ ) {
			pathGoals.Add ( OFSerializer.Serialize ( input.pathGoals[i] ) );
		}

		output.AddField ( "pathGoals", pathGoals );

		return output;
	}
	
	private function SerializeTrigger ( input : OATrigger ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

		output.AddField ( "type", input.type.ToString() );
		output.AddField ( "message", input.message );
		output.AddField ( "argument", input.argument );
		output.AddField ( "fireOnce", input.fireOnce );
		output.AddField ( "isActive", input.isActive );
		output.AddField ( "eventToTarget", input.eventToTarget );

		var go : GameObject = input.object;
		var so : OFSerializedObject;

		if ( go ) {
			so = go.GetComponent.< OFSerializedObject > ();
		}

		if ( so ) {
			output.AddField ( "object", so.id );
		
		} else {
			output.AddField ( "object", "" );
		
		}

		return output;
	}

	override function Serialize ( component : Component ) : JSONObject {
		var character : OACharacter = component as OACharacter;
		var trigger : OATrigger = component as OATrigger;

		if ( character ) {
			return SerializeCharacter ( character );

		} else if ( trigger ) {
			return SerializeTrigger ( trigger );

		} else {
			return null;

		}
	}
	
	private function DeserializeCharacter ( input : JSONObject, output : OACharacter ) {
		var behaviour : int = input.GetField ( "behaviour" ).n;
		output.behaviour = behaviour;
		output.attackTarget = input.GetField ( "attackTarget" ).b;
		output.unconcious = input.GetField ( "unconcious" ).b;

		// Inventory
		output.usingWeapons = input.GetField ( "usingWeapons" ).b;
		if ( output.usingWeapons ) {
			output.weaponCategoryPreference = input.GetField ( "weaponCategoryPreference" ).n;
			output.weaponSubcategoryPreference = input.GetField ( "weaponSubcategoryPreference" ).n;
		}

		// Conversation
		if ( input.HasField ( "conversationTreePath" ) && !String.IsNullOrEmpty ( input.GetField ( "conversationTreePath" ).str ) ) {
			output.conversationTreePath = input.GetField ( "conversationTreePath" ).str;
			
			if ( !output.conversationTree ) {
				output.conversationTree = output.gameObject.AddComponent.< OCTree > ();
			}

			var fullPath : String = Application.dataPath + output.conversationTreePath;

			OFDeserializer.Deserialize ( OFReader.LoadFile ( fullPath ), output.GetComponent.< OFSerializedObject > () );

			var speakerObjects : JSONObject = input.GetField ( "convoSpeakerObjects" );

			if ( speakerObjects ) {
				output.convoSpeakerObjects = new GameObject [ speakerObjects.list.Count ];

				for ( var i : int = 0; i < speakerObjects.list.Count; i++ ) {
					OFDeserializer.planner.DeferConnection ( function ( so : OFSerializedObject, i : int ) {
						output.convoSpeakerObjects[i] = so.gameObject;
					}, speakerObjects.list[i].str, i );
				}
			}
		}

		// Path
		var goalList : List.< JSONObject > = input.GetField ( "pathGoals" ).list;

		output.pathGoals = new Vector3 [ goalList.Count ];
		for ( i = 0; i < goalList.Count; i++ ) {
			output.pathGoals[i] = OFDeserializer.DeserializeVector3 ( goalList[i] );
		}
	}
	
	private function DeserializeTrigger ( input : JSONObject, output : OATrigger ) {
		output.type = OFDeserializer.ParseEnum ( OATriggerType, input.GetField ( "type" ).str );
		output.message = input.GetField ( "message" ).str;
		output.argument = input.GetField ( "argument" ).str;
		
		OFDeserializer.planner.DeferConnection ( function ( so : OFSerializedObject ) {
			output.object = so.gameObject;
		}, input.GetField ( "object" ).str );
		
		output.fireOnce = input.GetField ( "fireOnce" ).b;
		output.isActive = input.GetField ( "isActive" ).b;
		output.eventToTarget = input.GetField ( "eventToTarget" ).b;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var character : OACharacter = component as OACharacter;
		var trigger : OATrigger = component as OATrigger;

		if ( character ) {
			DeserializeCharacter ( input, character );

		} else if ( trigger ) {
			DeserializeTrigger ( input, trigger );

		}
	}
}
