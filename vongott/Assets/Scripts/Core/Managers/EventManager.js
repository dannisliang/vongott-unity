#pragma strict

class EventManager extends MonoBehaviour {
	//////////////////
	// Prerequisites
	//////////////////

	
	/////////////////
	// Main functions
	/////////////////
	public static function Fire ( id : String ) {
		Fire ( Loader.LoadEvent ( id ) );
	}
	
	public static function Fire ( event : GameEvent ) {
		if ( !event ) { return; }
		
		if ( event.condition != "" && event.condition != "(none)" ) {
			if ( !FlagManager.GetFlag ( event.condition, event.conditionBool ) ) { return; }
		}
		
		GameCore.Print ( "EventManager | Fire event type: " + event.type.ToString() );
		
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
				
			case GameEvent.eEventType.GiveItem:
				GiveItem ( event.giveItem, event.giveCost );
				break;
			
		}
	}
	
	public static function GiveItem ( path : String, credits : int ) {
		if ( InventoryManager.credits + credits >= 0 ) {
			var obj : GameObject = Resources.Load ( "Items/" + path ) as GameObject;
			
			InventoryManager.AddItem ( obj.GetComponent ( Item ) );
			InventoryManager.ChangeCredits ( credits );		
			GameCore.Print ( "EventManager | Got " + path );
			
			if ( credits < 0 ) {
				GameCore.Print ( "EventManager | " + credits + " credits deducted" );
			} else {
				GameCore.Print ( "EventManager | " + credits + " credits added" );
			}
			
		} else {
			GameCore.Print ( "EventManager | Not enough credits to buy " + path );
		
		}
	}
	
	public static function StartAnimation ( objGUID : String, animID : String, destination : Vector3 ) {
		for ( var c : Component in GameCore.levelContainer.GetComponentsInChildren ( Prefab ) ) {
			if ( c.gameObject.GetComponent(GUID).GUID == objGUID ) {
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
		iTween.Stop ();
		LoadingManager.nextScene = map;
		LoadingManager.nextSpawnPoint = spawnPoint;
		Application.LoadLevel ( "loading" );
	}
}