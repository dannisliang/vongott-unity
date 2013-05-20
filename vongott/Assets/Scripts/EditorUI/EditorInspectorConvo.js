#pragma strict

class EditorInspectorConvo extends MonoBehaviour {
	var inspector : GameObject;
	
	var label : OGLabel;
	var condition : OGButton;
	var chapter : OGPopUp;
	var scene : OGPopUp;
	var actorName : OGPopUp;
	var conversation : OGPopUp;
	
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
	
	// Selected chapter
	function SelectedChapter () {
		scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( chapter.selectedOption ) );
		
		scene.selectedOption = null;
		actorName.options = [];
		actorName.selectedOption = null;
		conversation.options = [];
		conversation.selectedOption = null;
		
		inspector.SendMessage ( "UpdateObject" );
	}
	
	// Selected scene
	function SelectedScene () {
		actorName.options = TrimFileNames ( EditorCore.GetConvoNames ( chapter.selectedOption, scene.selectedOption ) );
		
		actorName.selectedOption = null;
		conversation.options = [];
		conversation.selectedOption = null;
		
		inspector.SendMessage ( "UpdateObject" );
	}
	
	// Selected name
	function SelectedName () {
		conversation.options = TrimFileNames ( EditorCore.GetConvos ( chapter.selectedOption, scene.selectedOption, actorName.selectedOption ) );
		
		conversation.selectedOption = null;
		
		inspector.SendMessage ( "UpdateObject" );
	}
	
	// Selected conversation
	function SelectedConversation () {
		inspector.SendMessage ( "UpdateObject" );
	}
	
	// Init
	function Init () {
		chapter.options = TrimFileNames ( EditorCore.GetConvoChapters () );
	
		scene.options = [];
		scene.selectedOption = null;
		actorName.options = [];
		actorName.selectedOption = null;
		conversation.options = [];
		conversation.selectedOption = null;
	}
	
	// Update all
	function UpdateAll () {
		chapter.options = TrimFileNames ( EditorCore.GetConvoChapters () );
		scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( chapter.selectedOption ) );
		actorName.options = TrimFileNames ( EditorCore.GetConvoNames ( chapter.selectedOption, scene.selectedOption ) );
		conversation.options = TrimFileNames ( EditorCore.GetConvos ( chapter.selectedOption, scene.selectedOption, actorName.selectedOption ) );
	}
}