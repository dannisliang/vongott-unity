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

	function Update () {
		if ( line.listening ) {
			line.transform.localScale = new Vector3 ( line.transform.localScale.x, 80, 1 );
			line.transform.localPosition = new Vector3 ( line.transform.localPosition.x, line.transform.localPosition.y, -5 );
		} else {
			line.transform.localScale = new Vector3 ( line.transform.localScale.x, 20, 1 );
			line.transform.localPosition = new Vector3 ( line.transform.localPosition.x, line.transform.localPosition.y, 0 );
		}
	}
}
