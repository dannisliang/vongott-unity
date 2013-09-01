#pragma strict

class EditorInspectorConvo extends MonoBehaviour {
	var inspector : GameObject;
	
	var label : OGLabel;
	var condition : OGButton;
	var startQuest : OGButton;
	var endQuest : OGButton;
	var conversation : OGButton;
	
	// Pick flag
	function PickFlag ( btn : OGButton ) {
		EditorPicker.mode = "flag";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = inspector.GetComponent(EditorInspectorActor).UpdateObject;
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	// Pick quest
	function PickQuest ( btn : OGButton ) {
		EditorPicker.mode = "quest";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = inspector.GetComponent(EditorInspectorActor).UpdateObject;
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	// Pick convo
	function PickConvo ( btn : OGButton ) {
		EditorPicker.mode = "conversation";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = inspector.GetComponent(EditorInspectorActor).UpdateObject;
		
		OGRoot.GoToPage ( "Picker" );
	}
		
	// Init
	function Init () {
		
	}
	
	// Update all
	function UpdateAll () {
		
	}
}