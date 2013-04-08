////////////////////
// Prerequisites
////////////////////

// Inspector items
var mainList : UILabel;


////////////////////
// Quest log functions
////////////////////
// Get active quests
function GetActiveQuests () {
	mainList.text = "";
	
	if ( QuestManager.GetMainQuests().Length <= 0 ) {
		mainList.text = "( no active quests )";
		return;
	}
	
	for ( var q : Quest in QuestManager.GetMainQuests() ) {
		mainList.text += "- " + q.title + ": " + q.desc + "\n";
	}
}


////////////////////
// Init
////////////////////
function Start () {
	GetActiveQuests();
}

////////////////////
// Update
////////////////////
function Update () {
	if ( Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.Tab) ) {
		PageManager.GoToPage ( "HUD" );
	}
}