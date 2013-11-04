#pragma strict

class EditorConversationNodeLine extends MonoBehaviour {
	var line : OGTextField;
	var removeBtn : OGButton;
	var outputBtn : OGButton;

	public function SetText ( str : String ) {
		line.text = str;
	}

	public function SetTarget ( obj : GameObject, i : int ) {
		outputBtn.target = obj;
		outputBtn.argument = i.ToString();
		
		removeBtn.target = obj;
		removeBtn.argument = i.ToString();
			
		SetRemoveable ( i>0 );
	}
	
	public function SetRemoveable ( state : boolean ) {
		removeBtn.gameObject.SetActive ( state );
	}
}