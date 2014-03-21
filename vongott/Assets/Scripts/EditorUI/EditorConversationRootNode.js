#pragma strict

class EditorConversationRootNode extends MonoBehaviour {
	public var switcher : OGPopUp;
	public var output : OGButton;
	public var connectedTo : EditorConversationNode;
	public var auto : OGTickBox;
	public var passive : OGTickBox;
	public var extraButton : OGButton;
	
	function Update () {
		if ( connectedTo && extraButton.gameObject.activeSelf ) {
			extraButton.gameObject.SetActive ( false );
		} else if ( !connectedTo && !extraButton.gameObject.activeSelf ) {
			extraButton.gameObject.SetActive ( true );
		}	
	}
}
