#pragma strict

class EditorQuests extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	
	// Public vars
	var fileModeSwitch : OGPopUp;
	var fileModeSelect : GameObject;
	var fileModeCreate : GameObject;
	
	var selector : OGButton;
	var creator : OGTextField;
	
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
			currentQuest.isMainQuest = mainQuest.isTicked;
			currentQuest.skillPoints = int.Parse ( skillPoints.text );
			
			Saver.SaveQuest ( currentQuest );
		}
	}
	
	// Create quest
	function CreateQuest () {	
		selector.text = creator.text;
	
		fileModeSwitch.selectedOption = "Load";
		SelectMode();
		currentQuest = new Quest ();
		currentQuest.id = creator.text;
	}
	
	// Load quest
	function LoadQuest () {
		currentQuest = Loader.LoadQuest ( selector.text );
	
		title.text = currentQuest.title;
		description.text = currentQuest.desc;
		mainQuest.isTicked = currentQuest.isMainQuest;
		skillPoints.text = currentQuest.skillPoints.ToString();
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
	
	// Exit
	function Cancel () {
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	// Pick quest
	function PickQuest () {
		EditorPicker.mode = "quest";
		EditorPicker.button = selector;
		EditorPicker.sender = "Quests";
		OGRoot.GetInstance().GoToPage ( "Picker" );
	}	
	
	
	////////////////////
	// Init
	////////////////////
	// Page
	override function StartPage () {
		if ( selector.text != "(none)" ) {
			LoadQuest ();
		}
	}
}