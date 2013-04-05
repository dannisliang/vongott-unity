// Private classes
private class Quest {
	var id : String;
	var title : String;
	var desc : String;
	var active = false;
	var flag_end = "";
	var is_main_quest = false;
	
	function Quest ( is_main : boolean, new_id:String, new_title:String, new_desc:String, end:String ) {
		id = new_id;
		title = new_title;
		desc = new_desc;
		flag_end = end;
		is_main_quest = is_main;
	}
	
	function SetActive ( state : boolean ) {
		active = state;
	}
	
	function GetID () {
		return id;
	}
}

// Static vars
static var quests = [];
static var main_quest : Quest = null;

// =============== QUEST LIST
// Chapter 1
quests.Add ( new Quest ( true, "1_go_upstairs", "Go upstairs", "Go up and say hello", "2_talked_to_marcel" ) );

// Chapter 2
quests.Add ( new Quest ( true, "2_get_back_to_marcel", "Get back to Marcel", "Hear what Marcel has to say", "2_talked_to_marcel_done" ) );


// =============== QUEST FUNCTIONS
// Get quest by id
static function GetQuestByID ( id : String ) {
	for ( var q : Quest in quests ) {
		if ( q.GetID() == id ) {
			return q;
		}
	}
}

// Start quest
static function StartQuest ( id : String ) {
	var quest = GetQuestByID ( id );

	quest.SetActive ( true );
	if ( quest.is_main_quest ) {
		main_quest = quest;
	}

}

// End quest
static function EndQuest ( id : String ) {
	var quest = GetQuestByID ( id );

	quest.SetActive ( false );
	if ( quest.is_main_quest ) {
		main_quest = null;
	}
}

function Start () {

}

function Update () {

}