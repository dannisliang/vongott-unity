#pragma strict

@CustomEditor ( OACharacter )
public class OACharacterInspector extends Editor {
	override function OnInspectorGUI () {
		var character : OACharacter = target as OACharacter;

		if ( !character.pathFinder ) {
			character.pathFinder = character.GetComponent.< OPPathFinder > ();
			EditorGUILayout.LabelField ( "Character has no OPPathFinder component" );
			EditorGUILayout.Space ();
		}
		
		character.player = EditorGUILayout.ObjectField ( "Player object", character.player, typeof ( GameObject ), true ) as GameObject;

		character.behaviour = EditorGUILayout.Popup ( "Behaviour", character.behaviour, System.Enum.GetNames ( OABehaviour ) );

		EditorGUILayout.BeginHorizontal ();
		character.updatePathInterval = EditorGUILayout.FloatField ( "Update path every", character.updatePathInterval );
		EditorGUILayout.LabelField ( "seconds", GUILayout.Width ( 50 ) );
		EditorGUILayout.EndHorizontal ();
		
		EditorGUILayout.Space ();
		EditorGUILayout.LabelField ( "Inventory", EditorStyles.boldLabel );
			
		if ( !character.inventory ) {
			character.inventory = character.GetComponent.< OSInventory > ();
			EditorGUILayout.LabelField ( "Character has no OSInventory component" );
			EditorGUILayout.Space ();
		
		} else if ( character.inventory.definitions ) { 
			character.usingWeapons = EditorGUILayout.Toggle ( "Using weapons", character.usingWeapons );

			if ( character.usingWeapons ) {
				EditorGUILayout.BeginHorizontal ();
				character.weaponCategoryPreference = EditorGUILayout.Popup ( "Weapon preference", character.weaponCategoryPreference, character.inventory.definitions.GetCategoryStrings () );
				character.weaponSubcategoryPreference = EditorGUILayout.Popup ( character.weaponSubcategoryPreference, character.inventory.definitions.GetSubcategoryStrings ( character.weaponCategoryPreference ), GUILayout.Width ( 120 ) );
				EditorGUILayout.EndHorizontal ();
			}
		}

		EditorGUILayout.Space ();
		EditorGUILayout.LabelField ( "Conversation", EditorStyles.boldLabel );
		
		if ( !character.conversationTree ) {
			character.conversationTree = EditorGUILayout.ObjectField ( "Conversation tree", character.conversationTree, typeof ( OCTree ), false ) as OCTree;
		
		} else {
			var rootNodeStrings : String[] = new String[character.conversationTree.rootNodes.Length];
			for ( var i : int = 0; i < rootNodeStrings.Length; i++ ) {
				rootNodeStrings[i] = i.ToString();
			}
			
			character.convoRootNode = EditorGUILayout.Popup ( "Starting root node", character.convoRootNode, rootNodeStrings );	
		
			for ( i = 0; i < character.conversationTree.speakers.Length; i++ ) {
				character.conversationTree.speakers[i] = EditorGUILayout.ObjectField ( character.conversationTree.speakerIDs[i], character.conversationTree.speakers[i], typeof ( GameObject ), true ) as GameObject;
			}

		}
	}
}
