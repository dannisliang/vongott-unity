#pragma strict

public class OACharacterInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( OACharacter ); }
	
	override function Inspector () {
		var character : OACharacter = target.GetComponent.< OACharacter >();
	
		character.isEnemy = Toggle ( "Is enemy", character.isEnemy );
		character.behaviour = Popup ( "Behaviour", character.behaviour, System.Enum.GetNames ( typeof ( OABehaviour ) ) );
		
		// Inventory
		if ( character.inventory ) {
			Offset ( 0, 20 );
			character.usingWeapons = Toggle ( "Using weapons", character.usingWeapons );
			
			if ( character.usingWeapons ) {
				character.weaponCategoryPreference = Popup ( "Preference", character.weaponCategoryPreference, character.inventory.definitions.GetCategoryStrings () );
				character.weaponSubcategoryPreference = Popup ( " ", character.weaponSubcategoryPreference, character.inventory.definitions.GetSubcategoryStrings ( character.weaponCategoryPreference ) );
			}
		}

		// Conversation
		Offset ( 0, 20 );
		
		var tuple : OEObjectField.Tuple = ObjectField ( "Tree", character.conversationTreePath, typeof ( OCTree ), ".tree", character.GetComponent.< OFSerializedObject > () ) as OEObjectField.Tuple;
		
		if ( tuple ) {
			character.conversationTreePath = tuple.path;
			character.conversationTree = tuple.object as OCTree;
		}

		if ( character.conversationTree ) {
			var rootNodeStrings : String[] = new String[0];
		
			rootNodeStrings = new String[character.conversationTree.rootNodes.Length];
			for ( var i : int = 0; i < rootNodeStrings.Length; i++ ) {
				rootNodeStrings[i] = i.ToString();
			}

			character.convoRootNode = Popup ( "First root node", character.convoRootNode, rootNodeStrings );	

			if ( character.convoSpeakerObjects.Length != character.conversationTree.speakers.Length ) {
				character.convoSpeakerObjects = new GameObject [ character.conversationTree.speakers.Length ];
			}

			for ( i = 0; i < character.convoSpeakerObjects.Length; i++ ) {
				character.convoSpeakerObjects[i] = ObjectField ( character.conversationTree.speakers[i], character.convoSpeakerObjects[i], typeof ( GameObject ), OEObjectField.Target.Scene ) as GameObject;
			}
		}

		// Path
		Offset ( 0, 20 );

		character.updatePathInterval = FloatField ( "Path update interval", character.updatePathInterval );

		for ( i = 0; i < character.pathGoals.Length; i++ ) {
			character.pathGoals[i] = PointField ( "Goal #" + i.ToString(), character.pathGoals[i] );
		}

		if ( Button ( "Add" ) ) {
			var tmpGoals : List.< Vector3 > = new List.< Vector3 > ( character.pathGoals );
			tmpGoals.Add ( character.pathGoals.Length > 0 ? character.pathGoals[character.pathGoals.Length-1] : character.transform.position );
			character.pathGoals = tmpGoals.ToArray ();
		}

		if ( Button ( "Remove" ) ) {
			if ( character.pathGoals.Length > 0 ) {
				tmpGoals = new List.< Vector3 > ( character.pathGoals );
				tmpGoals.RemoveAt ( tmpGoals.Count - 1 );
				character.pathGoals = tmpGoals.ToArray ();
			}
		}
	
	}	
}
