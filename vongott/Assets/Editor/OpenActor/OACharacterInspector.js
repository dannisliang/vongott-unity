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
		
		if ( !character.inventory ) {
			character.inventory = character.GetComponent.< OSInventory > ();
			EditorGUILayout.LabelField ( "Character has no OSInventory component" );
			EditorGUILayout.Space ();
		}
		
		if ( !character.conversationTree ) {
			character.conversationTree = character.GetComponent.< OCTree > ();
			EditorGUILayout.LabelField ( "Character has no OCTree component" );
			EditorGUILayout.Space ();
		}

		character.player = EditorGUILayout.ObjectField ( "Player object", character.player, typeof ( GameObject ), true ) as GameObject;

		character.behaviour = EditorGUILayout.Popup ( "Behaviour", character.behaviour, System.Enum.GetNames ( OABehaviour ) );

		EditorGUILayout.BeginHorizontal ();
		character.updatePathInterval = EditorGUILayout.FloatField ( "Update path every", character.updatePathInterval );
		EditorGUILayout.LabelField ( "seconds", GUILayout.Width ( 50 ) );
		EditorGUILayout.EndHorizontal ();
		
		if ( character.inventory && character.inventory.definitions ) { 
			character.usingWeapons = EditorGUILayout.Toggle ( "Using weapons", character.usingWeapons );

			if ( character.usingWeapons ) {
				EditorGUILayout.BeginHorizontal ();
				character.weaponCategoryPreference = EditorGUILayout.Popup ( "Weapon preference", character.weaponCategoryPreference, character.inventory.definitions.GetCategoryStrings () );
				character.weaponSubcategoryPreference = EditorGUILayout.Popup ( character.weaponSubcategoryPreference, character.inventory.definitions.GetSubcategoryStrings ( character.weaponCategoryPreference ), GUILayout.Width ( 120 ) );
				EditorGUILayout.EndHorizontal ();
			}
		}
	}
}
