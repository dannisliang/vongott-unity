﻿#pragma strict

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
	var conditionBool : boolean = false;

	var animationObject : String = "";
	var animationType : String = "";
	var animationVector : Vector3 = Vector3.zero;

	var questID : String = "";
	var questAction : String = "";
	
	var nextPathName : String = "";
	
	var flagName : String = "";
	var flagBool : boolean = false;
	
	var travelMap : String = "";
	var travelSpawnPoint : String = "";
}