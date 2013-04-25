#pragma strict

class EditorConversations extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var background : OGRect;
	var title : OGLabel;
	var chapterList : OGPopUp;
	var sceneList : OGPopUp;
	var actorList : OGPopUp;
	
	// Private vars
	private var current_chapter : int;
	private var current_scene : int;
	private var current_conversation : String = "";
	
	////////////////////
	// Navigate
	////////////////////
	private function SelectActor ( actor : String ) {
		current_conversation = current_chapter + "/" + current_scene + "/" + actor;
		
		// list conversations
	}
	
	// Select scene
	private function SelectScene ( num : int ) {
		current_scene = num;
		
		actorList.enabled = false;
		actorList.Clear();
		
		// list actors		
		
		actorList.enabled = true;
	}
	
	// Select chapter
	private function SelectChapter ( num : int ) {
		current_chapter = num;
		
		sceneList.enabled = false;
		sceneList.Clear();
		
		// list scenes
		
		sceneList.enabled = true;
	}
	
	
	////////////////////
	// Init
	////////////////////
	override function Init () {		
		// background
		background = new OGRect ();
		background.x = ( Screen.width / 2 ) - ( Screen.width * 0.4 );
		background.y = ( Screen.height / 2 ) - ( Screen.height * 0.4 );
		background.width = Screen.width * 0.8;
		background.height = Screen.height * 0.8;
		
		// title
		title = new OGLabel ( "Conversation Editor" );
		title.x = background.x + 16;
		title.y = background.y + 16;
		title.style.fontStyle = FontStyle.Bold;
		title.style.fontSize = 12;
	
		// chapters list
		chapterList = new OGPopUp ( "Chapter" );
		chapterList.x = background.x + 16;
		chapterList.y = background.y + 48;
		
		for ( var i = 0; i < 20; i++ ) {
			chapterList.Add ( i.ToString(), function () { SelectChapter ( i ); } );
		}
		
		// scenes list
		sceneList = new OGPopUp ( "Scene" );
		sceneList.x = background.x + 128;
		sceneList.y = background.y + 48;
		
		for ( i = 0; i < 20; i++ ) {
			sceneList.Add ( i.ToString(), function () { SelectChapter ( i ); } );
		}
	
		// actors list
		sceneList = new OGPopUp ( "Scene" );
		sceneList.x = background.x + 128;
		sceneList.y = background.y + 48;
		
		for ( i = 0; i < 20; i++ ) {
			sceneList.Add ( i.ToString(), function () { SelectChapter ( i ); } );
		}
	
		// disable by default
		sceneList.enabled = false;
		actorList.enabled = false;
	
		// add widgets
		OGCore.Add ( background );
		OGCore.Add ( title );
		
		OGCore.Add ( chapterList );
	}
	
	////////////////////
	// Update
	////////////////////
	override function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGPageManager.GoToPage ( "BaseMenu" );
		}
	}
}