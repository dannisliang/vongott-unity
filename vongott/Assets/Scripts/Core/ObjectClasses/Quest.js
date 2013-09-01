#pragma strict

class Quest {
	var id : String;
	var title : String;
	var desc : String;
	var active = false;
	var isMainQuest = false;
	var skillPoints = 0;
	
	function SetActive ( state : boolean ) {
		active = state;
	}
	
	function GetID () {
		return id;
	}
}