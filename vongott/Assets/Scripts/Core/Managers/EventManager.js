#pragma strict

class EventManager extends MonoBehaviour {
	//////////////////
	// Prerequisites
	//////////////////

	
	/////////////////
	// Main functions
	/////////////////
	public static function Fire ( event : GameEvent ) {
		if ( event.condition != "" && event.condition != "(none)" ) {
			if ( !FlagManager.GetFlag ( event.condition, event.conditionBool ) ) { return; }
		}
		
		if ( event.type == GameEvent.eEventType.Animation ) {
			StartAnimation ( event.animationObject, event.animationType, event.animationVector );
		
		} else if ( event.type == GameEvent.eEventType.NextPath ) {
			NextPath ( event.nextPathName );
		
		} else if ( event.type == GameEvent.eEventType.SetFlag ) {
			SetFlag ( event.flagName, event.flagBool );
		
		} else if ( event.type == GameEvent.eEventType.Quest ) {
			if ( event.questAction == "Start" ) {
				StartQuest ( event.questID );
			} else {
				EndQuest ( event.questID );
			}
			
		} else if ( event.type == GameEvent.eEventType.Travel ) {
			GoToLocation ( event.travelMap, event.travelSpawnPoint );
		
		}
	}
	
	public static function StartAnimation ( objName : String, animID : String, destination : Vector3 ) {
		for ( var c : Component in GameCore.levelContainer.GetComponentsInChildren ( Prefab ) ) {
			if ( c.gameObject.name == objName ) {
				iTween.MoveTo ( c.gameObject, iTween.Hash ( "position", destination ) );
			}
		}
	}
	
	public static function NextPath ( n : String ) {
		for ( var c : Component in GameCore.levelContainer.GetComponentsInChildren ( Actor ) ) {
			if ( ( c as Actor ).displayName == n ) {
				( c as Actor ).NextPath ();
			}
		}
	}
	
	public static function SetFlag ( flag : String, bool : boolean ) {
		FlagManager.SetFlag ( flag, bool );
	}
	
	public static function EndQuest ( questName : String ) {
		QuestManager.EndQuest ( questName );
	}
	
	public static function StartQuest ( questName : String ) {
		QuestManager.StartQuest ( questName );
	}
	
	public static function GoToLocation ( map : String, spawnPoint : String ) {
		Loader.LoadMap ( map );
		
		var currentSpawnPoint : SpawnPoint;
		
		for ( var c : Component in GameCore.levelContainer.GetComponentsInChildren ( SpawnPoint ) ) {
			currentSpawnPoint = c as SpawnPoint;
			
			if ( currentSpawnPoint.gameObject.name == spawnPoint ) {
				break;
			}
		}
		
		GameCore.GetPlayerObject().transform.position = currentSpawnPoint.transform.position;
		GameCore.GetPlayerObject().transform.localEulerAngles = currentSpawnPoint.transform.localEulerAngles;
	}
}