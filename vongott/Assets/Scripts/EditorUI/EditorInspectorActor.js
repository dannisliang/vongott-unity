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
	
	function Init ( obj : GameObject ) {
	
	}
	
	function Update () {
		for ( var o : GameObject in EditorCore.GetSelectedObjects() ) {
			if ( o.GetComponent ( Actor ) ) {
				var a : Actor = o.GetComponent ( Actor );
				
				a.affiliation = stateControl.affiliation.selectedOption;
				a.mood = stateControl.mood.selectedOption;
			
			} else if ( o.GetComponent ( Conversation ) ) {
				var c : Conversation = o.GetComponent ( Conversation );
				
				c.chapter = int.Parse ( convoControl.chapter.selectedOption );
				c.scene = int.Parse ( convoControl.scene.selectedOption );
				c.actorName = convoControl.name.selectedOption;
			}
		}
	}
}