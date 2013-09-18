#pragma strict

class GameEvent {
	enum eEventType {
		Animation,
		Quest,
		Travel,
		NextPath,
		SetFlag
	}

	var type : eEventType;
	var delay : float = 0;
	var condition : String = "";
	var conditionBool : boolean;

	var animationObject : String;
	var animationType : String;
	var animationVector : Vector3;

	var questID : String;
	var questAction : String;
	
	var nextPathName : String;
	
	var flagName : String;
	var flagBool : boolean;
	
	var travelMap : String;
	var travelSpawnPoint : String;
}