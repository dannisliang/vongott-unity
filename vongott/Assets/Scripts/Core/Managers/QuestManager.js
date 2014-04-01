#pragma strict

////////////////////
// Prerequisites
////////////////////
// Static vars
static var quests : List.< Quest > = new List.< Quest >();


////////////////////
// Init
////////////////////
// All quests
static function Init () {	
	var allQuests : JSONObject = Loader.LoadQuests ();

	for ( var o : Object in allQuests.list ) {
		quests.Add ( Deserializer.DeserializeQuest ( o as JSONObject ) );
	}
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
	
	return null;
}

// Get main quests
static function GetMainQuests () : List.< Quest > {
	var sideQuests : List.< Quest > = new List.< Quest >();
	
	for ( var i = 0; i < quests.Count; i++ ) {
		if ( quests[i].isMainQuest && quests[i].active ) {
			sideQuests.Add ( quests[i] );
		}
	}
	
	return sideQuests;
}

// Get side quests
static function GetSideQuests () : List.< Quest > {
	var sideQuests : List.< Quest > = new List.< Quest >();
	
	for ( var i = 0; i < quests.Count; i++ ) {
		if ( !quests[i].isMainQuest && quests[i].active ) {
			sideQuests.Add ( quests[i] );
		}
	}
	
	return sideQuests;
}


////////////////////
// Quest actions
////////////////////
// Start
static function StartQuest ( id : String ) {
	var quest = GetQuestByID ( id );

	if ( quest == null ) { return; }

	quest.SetActive ( true );	

	UIHUD.GetInstance().ShowTimedNotification ( quest.title, 4.0 );

	GameCore.Print ( "QuestManager |  Quest started: " + id );
}

// End
static function EndQuest ( id : String ) {
	var quest = GetQuestByID ( id );

	if ( quest == null ) { return; }
	
	quest.SetActive ( false );
	
	GameCore.Print ( "QuestManager |  Quest ended: " + id );
}
