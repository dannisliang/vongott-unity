#pragma strict

class EventManager extends MonoBehaviour {
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
			
			case GameEvent.eEventType.ToggleDoor:
				ToggleDoor ( event.toggleDoorName, event.toggleDoorBool );
				break;
		
			case GameEvent.eEventType.Consequence:
				if ( !String.IsNullOrEmpty ( event.questID ) && event.questID != "(none)" ) {
					if ( event.questAction == "Start" ) {
						StartQuest ( event.questID );
					} else {
						EndQuest ( event.questID );
					}
				}

				if ( !String.IsNullOrEmpty ( event.flagName ) && event.flagName != "(none)" ) {
					SetFlag ( event.flagName, event.flagBool );
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
	
	public static function GiveItem ( path : String, credits : int ) : boolean {
		if ( GameCore.GetInventory().GetCurrencyAmount ( "Credits" ) + credits >= 0 ) {
			var obj : GameObject = Resources.Load ( "Items/" + path ) as GameObject;
			
			GameCore.Print ( "EventManager | Got " + path );
			
			GameCore.GetInventory().AddItem ( obj.GetComponent ( OSItem ) );
			GameCore.GetInventory().ChangeCurrencyAmount ( "Credits", credits );		
			
			if ( credits < 0 ) {
				GameCore.Print ( "EventManager | " + credits + " credits deducted" );
			} else {
				GameCore.Print ( "EventManager | " + credits + " credits added" );
			}
			return true;

		} else {
			GameCore.Print ( "EventManager | Not enough credits to buy " + path );
			return false;

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

	public static function ToggleDoor ( n : String, b : boolean ) {
		var go : GameObject = GameCore.GetObjectFromGUID ( n );

		if ( go && go.GetComponent(Door) ) {
			var door : Door = go.GetComponent(Door);

			if ( door.closed == b ) {
				door.Toggle ();
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
		
		GameCore.GetInstance().StartCoroutine ( GameCore.GetInstance().LoadLevel ( map, spawnPoint ) );
	}
}
