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

	for ( var o : JSONObject in allQuests.list ) {
		quests.Add ( Deserializer.DeserializeQuest ( o ) );
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

	UIHUD.ShowTimedNotification ( quest.title, 4.0 );

	GameCore.Print ( "QuestManager |  quest started: " + id );
}

// End
static function EndQuest ( id : String ) {
	var quest = GetQuestByID ( id );

	quest.SetActive ( false );
	
	GameCore.Print ( "QuestManager |  quest ended: " + id );
}