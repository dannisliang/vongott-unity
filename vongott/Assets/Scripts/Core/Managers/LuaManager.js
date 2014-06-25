#pragma strict

public class LuaManager extends MonoBehaviour {
	public var defaultParent : Transform;

	// Characters
	public function AddCharacter ( name : String, x : float, y : float, z : float ) : OACharacter {
		var go : GameObject = Resources.Load ( "Prefabs/Actors/" + name ) as GameObject;

		if ( go ) {
			go = Instantiate ( go );

			if ( defaultParent ) {
				go.transform.parent = defaultParent;
			}

			go.transform.position = new Vector3 ( x, y, z );
		
			return go.GetComponent.< OACharacter > ();
		}

		return null;
	}

	// Get by id
	public function GetObject ( id : String ) : LuaScriptableObject {
		var go : GameObject = GameCore.GetInstance().GetObjectFromGUID ( id );

		if ( go ) {
			return go.GetComponent.< LuaScriptableObject > ();
		
		} else {
			return null;
		
		}
	}

	// Quests
	public function ProgressObjective ( title : String, i : int, amount : int ) {
		var quest : OCQuests.Quest = GameCore.GetQuestManager ().GetUserQuest ( title );

		i--;

		if ( quest ) {
			quest.ProgressObjective ( i, amount );
		}
	}
	
	public function CompleteObjective ( title : String, i : int ) {
		var quest : OCQuests.Quest = GameCore.GetQuestManager ().GetUserQuest ( title );

		i--;

		if ( quest ) {
			quest.CompleteObjective ( i );
		}
	}
}
