#pragma strict

class GameEvent {
	enum eEventType {
		Animation,
		Quest,
		Travel,
		NextPath,
		SetFlag,
		GiveItem,
		ToggleDoor,
		Consequence
	}

	var id : String = "";
	var type : eEventType;
	var delay : float = 0;
	var condition : String = "";
	var conditionBool : boolean = false;

	var animationObject : String = "";
	var animationType : String = "";
	var animationVector : Vector3 = Vector3.zero;

	var questID : String = "";
	var questAction : String = "";
	var flagName : String = "";
	var flagBool : boolean = false;
	
	var nextPathName : String = "";
	
	var toggleDoorName : String = "";
	var toggleDoorBool : boolean = false;

	var travelMap : String = "";
	var travelSpawnPoint : String = "";
	
	var giveItem : String;
	var giveCost : int;
}
