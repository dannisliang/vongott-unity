#pragma strict

////////////////////
// Prerequisites
////////////////////
// Private classes
private class Quest {
	var id : String;
	var title : String;
	var desc : String;
	var active = false;
	var flagEnd = "";
	var isMainQuest = false;
	var skillPoints = 0;
	
	function Quest ( is_main : boolean, new_id:String, new_title:String, new_desc:String, end:String, points:int ) {
		id = new_id;
		title = new_title;
		desc = new_desc;
		flagEnd = end;
		isMainQuest = is_main;
		skillPoints = points;
	}
	
	function SetActive ( state : boolean ) {
		active = state;
	}
	
	function GetID () {
		return id;
	}
}

// Static vars
static var quests : List.< Quest > = new List.< Quest >();


////////////////////
// Init
////////////////////
// All quests
static function Init () {	
	// Chapter 1
	quests.Add ( new Quest ( true, "1_go_upstairs", "Go upstairs", "Go up and say hello", "2_talked_to_marcel", 100 ) );
	
	// Chapter 2
	quests.Add ( new Quest ( true, "2_get_back_to_marcel", "Get back to Marcel", "Hear what Marcel has to say", "2_talked_to_marcel_done", 0 ) );
}


////////////////////
// Clear
////////////////////
// All quests
static function Clear () {
	quests.Clear();
}

////////////////////
// Quest info
////////////////////
// Get quest by id
static function GetQuestByID ( id : String ) : Quest {
	for ( var i = 0; i < quests.Count; i++ ) {
		if ( quests[i].GetID() == id ) {
			return quests[i];
		}
	}
}

// Get main quests
static function GetMainQuests () {
	var indexes = new Array();
	
	for ( var i = 0; i < quests.Count; i++ ) {
		if ( quests[i].isMainQuest && quests[i].active ) {
			indexes.Push (i);
		}
	}
	
	var list = new Quest[indexes.length];
	
	for ( i = 0; i < indexes.length; i++ ) {
		list[i] = quests[indexes[i]];
	}
	
	return list;
}

// Get side quests
static function GetSideQuests () {
	var indexes = new Array();
	
	for ( var i = 0; i < quests.Count; i++ ) {
		if ( !quests[i].isMainQuest && quests[i].active ) {
			indexes.Push (i);
		}
	}
	
	var list = new Quest[indexes.length];
	
	for ( i = 0; i < indexes.length; i++ ) {
		var index : int = indexes[i];
		list[i] = quests[index];
	}
	
	return list;
}


////////////////////
// Quest actions
////////////////////
// Start
static function StartQuest ( id : String ) {
	var quest = GetQuestByID ( id );

	quest.SetActive ( true );	

	Debug.Log ( "QuestManager |  quest started: " + id );
}

// End
static function EndQuest ( id : String ) {
	var quest = GetQuestByID ( id );

	quest.SetActive ( false );
	
	Debug.Log ( "QuestManager |  quest ended: " + id );
}