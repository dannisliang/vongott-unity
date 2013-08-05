#pragma strict

class UIQuests extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Inspector items
	var mainList : OGLabel;
	
	
	////////////////////
	// Quest log functions
	////////////////////
	// Get active quests
	function GetActiveQuests () {
		mainList.text = "";
		
		if ( QuestManager.GetMainQuests().Count <= 0 ) {
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
	override function StartPage () {
		GetActiveQuests();
		GameCore.GetInstance().SetPause ( true );
	}
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.Q) ) {
			OGRoot.GoToPage ( "HUD" );
			GameCore.ToggleControls ( true );
		}
	}
}