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
	
	function Update () {
		for ( var o : GameObject in EditorCore.GetSelectedObjects() ) {
			if ( o.GetComponent ( Actor ) ) {
				var a : Actor = o.GetComponent ( Actor );
				
				a.conversation.chapter = int.Parse ( convoControl.chapter.selectedOption );
				a.conversation.scene = int.Parse ( convoControl.scene.selectedOption );
				a.conversation.name = convoControl.name.selectedOption;
			
				a.state.affiliation = stateControl.affiliation.selectedOption;
				a.state.mood = stateControl.mood.selectedOption;
			}
		}
	}
}