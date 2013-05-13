#pragma strict

class EditorConversations extends OGPage {
	var entryInstance : EditorConversationEntry;
	var scrollView : OGScrollView;
	
	override function StartPage () {
		var test : EditorConversationEntry = Instantiate ( entryInstance );
		test.transform.parent = scrollView.transform;
		test.transform.localPosition = Vector3.zero;
	}
}