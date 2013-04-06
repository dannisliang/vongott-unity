////////////////////
// Prerequisites
////////////////////
// Private classes
private class Quest {
	var id : String;
	var title : String;
	var desc : String;
	var active = false;
	var flag_end = "";
	var is_main_quest = false;
	var skill_points = 0;
	
	function Quest ( is_main : boolean, new_id:String, new_title:String, new_desc:String, end:String, points:int ) {
		id = new_id;
		title = new_title;
		desc = new_desc;
		flag_end = end;
		is_main_quest = is_main;
		skill_points = points;
	}
	
	function SetActive ( state : boolean ) {
		active = state;
	}
	
	function GetID () {
		return id;
	}
}

// Static vars
static var quests = new Quest[2];
static var main_quest : Quest = null;


////////////////////
// Init
////////////////////
// All quests
static function InitQuests () {	
	// Chapter 1
	quests[0] = new Quest ( true, "1_go_upstairs", "Go upstairs", "Go up and say hello", "2_talked_to_marcel", 100 );
	
	// Chapter 2
	quests[1] = new Quest ( true, "2_get_back_to_marcel", "Get back to Marcel", "Hear what Marcel has to say", "2_talked_to_marcel_done", 0 );
}


////////////////////
// Quest info
////////////////////
// Get quest by id
static function GetQuestByID ( id : String ) {
	for ( var i = 0; i < quests.Length; i++ ) {
		if ( quests[i].GetID() == id ) {
			return quests[i];
		}
	}
}

// Get main quests
static function GetMainQuests () {
	var indexes = new Array();
	
	for ( var i = 0; i < quests.Length; i++ ) {
		if ( quests[i].is_main_quest && quests[i].active ) {
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
	
	for ( var i = 0; i < quests.Length; i++ ) {
		if ( !quests[i].is_main_quest && quests[i].active ) {
			indexes.Push (i);
		}
	}
	
	var list = new Quest[indexes.length];
	
	for ( i = 0; i < indexes.length; i++ ) {
		list[i] = quests[indexes[i]];
	}
	
	return list;
}


////////////////////
// Quest actions
////////////////////
// Start
static function StartQuest ( id : String ) {
	Debug.Log ( "... QuestManager | starting quest: " + id );
	
	var quest = GetQuestByID ( id );

	quest.SetActive ( true );
	if ( quest.is_main_quest ) {
		main_quest = quest;
	}
	
}

// End
static function EndQuest ( id : String ) {
	var quest = GetQuestByID ( id );

	quest.SetActive ( false );
	if ( quest.is_main_quest ) {
		main_quest = null;
	}
}