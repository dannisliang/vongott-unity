#pragma strict

public class OFOpenActor extends OFPlugin {
	override function CheckType ( type : System.Type ) {
		return type == typeof ( OACharacter );
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var input : OACharacter = component as OACharacter;

		if ( !input ) { return null; }
		
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
	
		output.AddField ( "health", input.health );

		// Inventory
		output.AddField ( "usingWeapons", input.usingWeapons );
		output.AddField ( "weaponCategoryPreference", input.weaponCategoryPreference );
		output.AddField ( "weaponSubcategoryPreference", input.weaponSubcategoryPreference );

		// Conversation
		if ( input.conversationTree ) {
			output.AddField ( "conversationTree", Serialize ( input.conversationTree ) );
		
			var speakers : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

			for ( var i : int = 0; i < input.convoSpeakers.Length; i++ ) {
				var go : GameObject = input.convoSpeakers[i];
				var so : OFSerializedObject;

				if ( go ) {
					so = go.GetComponent.< OFSerializedObject > ();
				}

				if ( so ) {
					speakers.Add ( so.id );
				
				} else {
					speakers.Add ( "" );
				
				}
			}

			output.AddField ( "convoSpeakers", speakers );
		}

		// Path
		output.AddField ( "updatePathInterval", input.updatePathInterval );
		
		var pathGoals : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
		
		for ( i = 0; i < input.pathGoals.Length; i++ ) {
			pathGoals.Add ( OFSerializer.Serialize ( input.pathGoals[i] ) );
		}

		output.AddField ( "pathGoals", pathGoals );

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var output : OACharacter = component as OACharacter;

		if ( !output ) { return; }
		
		output.health = input.GetField ( "health" ).n;
		output.usingWeapons = input.GetField ( "usingWeapons" ).b;

		// Inventory
		if ( output.usingWeapons ) {
			output.weaponCategoryPreference = input.GetField ( "weaponCategoryPreference" ).n;
			output.weaponSubcategoryPreference = input.GetField ( "weaponSubcategoryPreference" ).n;
		}

		// Conversation
		if ( input.HasField ( "conversationTree" ) ) {
			if ( !output.conversationTree ) {
				output.conversationTree = output.gameObject.AddComponent.< OCTree > ();
			}

			Deserialize ( input.GetField ( "conversationTree" ), output.conversationTree );		
		
			var speakerList : List.< JSONObject > = input.GetField ( "convoSpeakers" ).list;

			output.convoSpeakers = new GameObject [ speakerList.Count ];
			
			for ( var i : int = 0; i < speakerList.Count; i++ ) {
				OFDeserializer.DeferConnection ( function ( so : OFSerializedObject, index : int ) {
					if ( so ) {
						output.convoSpeakers[index] = so.gameObject;
					}
				}, speakerList[i].str, i );
			}
		}

		// Path
		output.updatePathInterval = input.GetField ( "updatePathInterval" ).n;

		var goalList : List.< JSONObject > = input.GetField ( "pathGoals" ).list;

		output.pathGoals = new Vector3 [ goalList.Count ];
		for ( i = 0; i < goalList.Count; i++ ) {
			output.pathGoals[i] = OFDeserializer.DeserializeVector3 ( goalList[i] );
		}
	}
}
