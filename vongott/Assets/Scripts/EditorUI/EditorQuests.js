#pragma strict

class EditorQuests extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Private classes
	private class Selector {
		var chapter : OGPopUp;
		var scene : OGPopUp;
		var name : OGPopUp;
	}
	
	private class Creator {
		var chapter : OGTextField;
		var scene : OGTextField;
		var name : OGTextField;
	}
	
	// Public vars
	var fileModeSwitch : OGPopUp;
	var fileModeSelect : GameObject;
	var fileModeCreate : GameObject;
	
	var selector : Selector;
	var creator : Creator;
	
	@HideInInspector var currentQuest : Quest;
	
	var title : OGTextField;
	var description : OGTextField;
	var mainQuest : OGTickBox;
	var skillPoints : OGTextField;

	
	////////////////////
	// File I/O
	////////////////////
	// Trim filename
	function TrimFileNames ( paths : String[] ) : String[] {
		var newArray : String[] = new String[paths.Length];
		
		for ( var i = 0; i < paths.Length; i++ ) {
			var path = paths[i].Split("\\"[0]);
			var fileName = path[path.Length-1];
			var extention = fileName.Split("."[0]);
			var name = extention[0];
			newArray[i] = name;
		}
		
		return newArray;
	}

	// Save quest
	function SaveQuest () {
		if ( currentQuest ) {
			currentQuest.title = title.text;
			currentQuest.desc = description.text;
			currentQuest.isMainQuest = mainQuest.isChecked;
			currentQuest.skillPoints = int.Parse ( skillPoints.text );
			
			Saver.SaveQuest ( selector.chapter.selectedOption, selector.scene.selectedOption, selector.name.selectedOption, currentQuest );
		}
	}
	
	// Create quest
	function CreateQuest () {
		Saver.SaveQuest ( creator.chapter.text, creator.scene.text, creator.name.text, new Quest () );
		
		selector.chapter.selectedOption = creator.chapter.text;
		selector.scene.selectedOption = creator.scene.text;
		selector.name.selectedOption = creator.name.text;
		
		LoadQuest ();
	}
	
	// Load quest
	function LoadQuest () {
		currentQuest = Loader.LoadQuest ( selector.chapter.selectedOption, selector.scene.selectedOption, selector.name.selectedOption );
	
		title.text = currentQuest.title;
		description.text = currentQuest.desc;
		mainQuest.isChecked = currentQuest.isMainQuest;
		skillPoints.text = currentQuest.skillPoints.ToString();
	}
	
	// Selected chapter, scene and name
	function LoadChapters () {
		selector.chapter.options = TrimFileNames ( EditorCore.GetQuestChapters () );
	}
	
	function SelectedChapter () {		
		selector.scene.options = TrimFileNames ( EditorCore.GetQuestScenes ( selector.chapter.selectedOption ) );
	}
	
	function SelectedScene () {
		selector.name.options = TrimFileNames ( EditorCore.GetQuests ( selector.chapter.selectedOption, selector.scene.selectedOption ) );
	}
	
	
	////////////////////
	// Navigation
	////////////////////
	// Select file mode
	function SelectMode () {
		if ( fileModeSwitch.selectedOption == "Load" ) {
			fileModeSelect.SetActive ( true );
			fileModeCreate.SetActive ( false );
		} else {
			fileModeSelect.SetActive ( false );
			fileModeCreate.SetActive ( true );
		}
	}
	
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	
	////////////////////
	// Init
	////////////////////
	// Page
	override function StartPage () {
		LoadChapters ();
	}
}