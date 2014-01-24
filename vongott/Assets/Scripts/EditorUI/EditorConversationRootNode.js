#pragma strict

class EditorConversationRootNode extends MonoBehaviour {
	public var extraButton : OGButton;
	public var output : OGButton;
	public var removeButton : OGButton;
	public var connectedTo : EditorConversationNode;
	public var indexLabel : OGLabel;
	public var auto : OGTickBox;
	
	public function SetConnection ( node : EditorConversationNode ) {
		if ( connectedTo && !node ) {
			EditorConversationMap.GetInstance().SetOrphaned ( connectedTo );
		}
		
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
		if ( connectedTo && extraButton.gameObject.activeSelf ) {
			extraButton.gameObject.SetActive ( false );
		} else if ( !connectedTo && !extraButton.gameObject.activeSelf ) {
			extraButton.gameObject.SetActive ( true );
		}	
	}
}
