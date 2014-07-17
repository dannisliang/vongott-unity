#pragma strict

@CustomEditor ( OACharacter )
public class OACharacterInspector extends Editor {
	private function SavePrefab ( target : UnityEngine.Object ) {
		var selectedGameObject : GameObject;
		var selectedPrefabType : PrefabType;
		var parentGameObject : GameObject;
		var prefabParent : UnityEngine.Object;
		     
		selectedGameObject = Selection.gameObjects[0];
		selectedPrefabType = PrefabUtility.GetPrefabType(selectedGameObject);
		parentGameObject = selectedGameObject.transform.root.gameObject;
		prefabParent = PrefabUtility.GetPrefabParent(selectedGameObject);
		     
		EditorUtility.SetDirty(target);
		     
		if (selectedPrefabType == PrefabType.PrefabInstance) {
			PrefabUtility.ReplacePrefab(parentGameObject, prefabParent,
			ReplacePrefabOptions.ConnectToPrefab);
	    	}
	}
	
	override function OnInspectorGUI () {
		var character : OACharacter = target as OACharacter;
		var i : int = 0;

		DrawDefaultInspector ();

		if ( !character.pathFinder ) {
			character.pathFinder = character.GetComponent.< OPPathFinder > ();
			EditorGUILayout.LabelField ( "Character has no OPPathFinder component" );
			EditorGUILayout.Space ();
		}
		
		EditorGUILayout.Space ();
		EditorGUILayout.LabelField ( "Barks", EditorStyles.boldLabel );

		var tmpBarks : List.< OACharacter.Bark >;

		for ( i = 0; i < character.barks.Length; i++ ) {
			EditorGUILayout.BeginHorizontal ();
			
			GUI.backgroundColor = Color.red;
			if ( GUILayout.Button ( "x", GUILayout.Width ( 28 ), GUILayout.Height ( 14 ) ) ) {
				tmpBarks = new List.< OACharacter.Bark > ( character.barks );

				tmpBarks.RemoveAt ( i );

				character.barks = tmpBarks.ToArray ();
				return;
			}
			GUI.backgroundColor = Color.white;
			
			EditorGUILayout.BeginVertical ();
		
			character.barks[i].type = EditorGUILayout.Popup ( character.barks[i].type, System.Enum.GetNames ( OACharacter.Bark.Type ), GUILayout.Width ( 80 ) );
			EditorGUILayout.LabelField ( "Subtitle:", GUILayout.Width ( 80 ) );

			EditorGUILayout.EndVertical ();
			
			EditorGUILayout.BeginVertical ();
			
			character.barks[i].clip = EditorGUILayout.ObjectField ( character.barks[i].clip, typeof ( AudioClip ), false ) as AudioClip;
			character.barks[i].subtitle = EditorGUILayout.TextField ( character.barks[i].subtitle );
			
			EditorGUILayout.EndVertical ();
			
			EditorGUILayout.EndHorizontal ();
		
			EditorGUILayout.Space ();
		}
		
		GUI.backgroundColor = Color.green;
		if ( GUILayout.Button ( "+", GUILayout.Width ( 28 ), GUILayout.Height ( 14 ) ) ) {
			tmpBarks = new List.< OACharacter.Bark > ( character.barks );

			tmpBarks.Add ( new OACharacter.Bark () );

			character.barks = tmpBarks.ToArray ();
			return;
		}
		GUI.backgroundColor = Color.white;

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
			
		if ( character.gameObject.activeInHierarchy ) {
			character.conversationTree = EditorGUILayout.ObjectField ( "Conversation tree", character.conversationTree, typeof ( OCTree ), false ) as OCTree;
		
			if ( character.conversationTree != null ) {
				var rootNodeStrings : String[] = new String[character.conversationTree.rootNodes.Length];
				for ( i = 0; i < rootNodeStrings.Length; i++ ) {
					rootNodeStrings[i] = i.ToString();
				}
				
				character.convoRootNode = EditorGUILayout.Popup ( "Starting root node", character.convoRootNode, rootNodeStrings );	
		
				for ( i = 0; i < character.convoSpeakerObjects.Length; i++ ) {
					character.convoSpeakerObjects[i] = EditorGUILayout.ObjectField ( character.conversationTree.speakers[i], character.convoSpeakerObjects[i], typeof ( GameObject ), true ) as GameObject;
				}

			}
		
		} else {
			EditorGUILayout.LabelField ( "Conversation trees should only be linked to characters in the scene." );
			character.conversationTree = null;

		}

		if ( GUI.changed ) {
			SavePrefab ( target );
		}

		// Warnings
		var go : GameObject = character.gameObject;

		if ( go ) {
			if ( !go.GetComponent.< CharacterController > () ) {
				GUI.color = Color.red;
				EditorGUILayout.LabelField ( "WARNING", EditorStyles.boldLabel );
				GUI.color = Color.white;

				EditorGUILayout.HelpBox ( "CharacterController component missing", MessageType.Warning, true );
				if ( GUILayout.Button ( "Fix" ) ) {
					go.AddComponent.< CharacterController > ();
				}
			}
		}
	}
}
