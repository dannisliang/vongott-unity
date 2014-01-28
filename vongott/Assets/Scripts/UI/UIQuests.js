#pragma strict

class UIQuests extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Inspector items
	var mainList : OGLabel;
	var sideList : OGLabel;
	
	
	////////////////////
	// Quest log functions
	////////////////////
	// Get active quests
	function GetActiveQuests () {
		mainList.text = "";
		sideList.text = "";
		
		
		// Main quests
		if ( QuestManager.GetMainQuests().Count <= 0 ) {
			mainList.text = "( no active quests )";
			
		} else {
			for ( var q : Quest in QuestManager.GetMainQuests() ) {
				mainList.text += "- " + q.title + ": " + q.desc + "\n";
			}
		
		}
		
		
		// Side quests
		if ( QuestManager.GetSideQuests().Count <= 0 ) {
			sideList.text = "( no active quests )";
		
		} else {
			for ( var q : Quest in QuestManager.GetSideQuests() ) {
				sideList.text += "- " + q.title + ": " + q.desc + "\n";
			}
		
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
			OGRoot.GetInstance().GoToPage ( "HUD" );
			GameCore.GetInstance().SetControlsActive ( true );
		}
	}
}