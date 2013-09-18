#pragma strict

class EditorInspectorEvent extends MonoBehaviour {
	public var eventIndex : OGLabel;
	public var eventDelay : OGTextField;
	public var eventType : OGPopUp;
	public var eventTypeContainers : Transform;
	
	private class AnimationType {
		public var button : OGButton;
		public var popUp : OGPopUp;
		public var x : OGTextField;
		public var y : OGTextField;
		public var z : OGTextField;
	}
	
	private class QuestType {
		public var button : OGButton;
		public var popUp : OGPopUp;
	}
	
	private class TravelType {
		public var button : OGButton;
		public var textField : OGTextField;
	}
	
	private class NextPathType {
		public var button : OGButton;
	}
	
	private class SetFlagType {
		public var button : OGButton;
		public var tickBox : OGTickBox;
	}
	
	public var anim : AnimationType;
	public var quest : QuestType;
	public var travel : TravelType;
	public var nextPath : NextPathType;
	public var setFlag : SetFlagType;
	
	private function SetVisible ( n : String ) {
		for ( var i = 0; i < eventTypeContainers.childCount; i++ ) {
			eventTypeContainers.GetChild(i).gameObject.SetActive ( eventTypeContainers.GetChild(i).gameObject.name == n );
		}
	}
	
	function Update () {
		SetVisible ( eventType.selectedOption );
	}
	
	public function UpdateObject () {
		GameObject.FindObjectOfType(EditorInspectorTrigger).UpdateObject();
	}
	
	public function RemoveEvent () {
		GameObject.FindObjectOfType(EditorInspectorTrigger).RemoveEvent ( this.gameObject );
	}
	
}