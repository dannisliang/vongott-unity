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
		
		switch ( event.type ) {
			case GameEvent.eEventType.Animation:
				StartAnimation ( event.animationObject, event.animationType, event.animationVector );
				break;
		
			case GameEvent.eEventType.NextPath:
				NextPath ( event.nextPathName );
				break;
		
			case GameEvent.eEventType.SetFlag:
				SetFlag ( event.flagName, event.flagBool );
				break;
		
			case GameEvent.eEventType.Quest:
				if ( event.questAction == "Start" ) {
					StartQuest ( event.questID );
				} else {
					EndQuest ( event.questID );
				}
				break;
			
			case GameEvent.eEventType.Travel:
				GoToLocation ( event.travelMap, event.travelSpawnPoint );
				break;
			
		}
	}
	
	public static function StartAnimation ( objName : String, animID : String, destination : Vector3 ) {
		for ( var c : Component in GameCore.levelContainer.GetComponentsInChildren ( Prefab ) ) {
			if ( c.gameObject.GetComponent(GUID).GUID == objName ) {
				if ( animID == "MoveTo" ) {
					iTween.MoveTo ( c.gameObject, iTween.Hash ( "position", destination ) );
				
				} else if ( animID == "MoveBy" ) {
					iTween.MoveBy ( c.gameObject, iTween.Hash ( "amount", destination ) );
				
				} else if ( animID == "RotateTo" ) {
					iTween.RotateTo ( c.gameObject, iTween.Hash ( "rotation", destination ) );
				
				} else if ( animID == "RotateBy" ) {
					iTween.RotateBy ( c.gameObject, iTween.Hash ( "amount", destination / 360 ) );
				
				}
			
			}
		}
	}
	
	public static function NextPath ( n : String ) {
		for ( var c : Component in GameCore.levelContainer.GetComponentsInChildren ( Actor ) ) {
			if ( c.gameObject.GetComponent(GUID).GUID == n ) {
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