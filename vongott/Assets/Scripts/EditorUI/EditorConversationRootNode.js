#pragma strict

class EditorConversationRootNode extends MonoBehaviour {
	public var extraButton : OGButton;
	public var output : OGButton;
	public var removeButton : OGButton;
	public var connectedTo : EditorConversationNode;
	public var indexLabel : OGLabel;
	public var nodeContainer : Transform;
	
	public function SetConnection ( node : EditorConversationNode ) {
		connectedTo = node;
	}
	
	public function TryConnect () {	
		SetConnection ( null );
	
		EditorConversationMap.GetInstance().ConnectNodes (
			function ( other : EditorConversationNode ) {
				SetConnection ( other );
			},
			
			output
		);
	}
	
	public function Remove () {
		EditorConversationMap.GetInstance().RemoveRootNode ( this );
	}
	
	public function CreateNode ( btn : OGButton ) {
		EditorConversationMap.GetInstance().CreateNode ( this );
	}
	
	function Update () {
		extraButton.gameObject.SetActive ( connectedTo == null );
	}
}