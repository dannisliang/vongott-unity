#pragma strict

private class ConvoControl {
	var chapter : OGPopUp;
	var scene : OGPopUp;
	var name : OGPopUp;
}

private class StateControl {
	var affiliation : OGPopUp;
	var mood : OGPopUp;
}

class EditorInspectorActor extends MonoBehaviour {
	var convoControl : ConvoControl;
	var stateControl : StateControl;
		
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
		if ( convoControl.scene.selectedOption != "<c>" ) {
			convoControl.scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( int.Parse ( convoControl.chapter.selectedOption ) ) );
			UpdateObject ();
		}
	}
	
	// Selected scene
	function SelectedScene () {
		if ( convoControl.scene.selectedOption != "<s>" ) {
			convoControl.name.options = TrimFileNames ( EditorCore.GetConvos ( int.Parse ( convoControl.chapter.selectedOption ), int.Parse ( convoControl.scene.selectedOption ) ) );
			UpdateObject ();
		}
	}
	
	// Selected name
	function SelectedName () {
		if ( convoControl.name.selectedOption != "<name>" ) {
			UpdateObject ();
		}
	}
	
	// Init
	function Init ( obj : GameObject ) {			
		var a : Actor = obj.GetComponent ( Actor );
		stateControl.affiliation.selectedOption = a.affiliation;
		stateControl.mood.selectedOption = a.mood;
		
		var c : Conversation = obj.GetComponent( Conversation );
		convoControl.chapter.selectedOption = c.chapter.ToString();
		convoControl.scene.selectedOption = c.scene.ToString();
		convoControl.name.selectedOption = c.actorName;
	
		convoControl.chapter.options = TrimFileNames ( EditorCore.GetConvoChapters() );
		convoControl.scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( c.scene ) );
		convoControl.name.options = TrimFileNames ( EditorCore.GetConvos ( c.scene, c.chapter ) );
	}
	
	// Update
	function UpdateObject () {
		for ( var o : GameObject in EditorCore.GetSelectedObjects() ) {
			if ( o.GetComponent ( Actor ) ) {
				var a : Actor = o.GetComponent ( Actor );
				
				a.affiliation = stateControl.affiliation.selectedOption;
				a.mood = stateControl.mood.selectedOption;
			} 
			
			if ( o.GetComponent ( Conversation ) ) {
				var c : Conversation = o.GetComponent ( Conversation );
				
				c.chapter = int.Parse ( convoControl.chapter.selectedOption );
				c.scene = int.Parse ( convoControl.scene.selectedOption );
				c.actorName = convoControl.name.selectedOption;
			}
		}
		
		
	}
}