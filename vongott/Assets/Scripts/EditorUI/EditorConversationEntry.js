#pragma strict

class EditorConversationEntry extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Private classes	
	private class Group {
		var instance : GameObject;
		var options : OGPopUp;
		@HideInInspector var lines : EditorConversationGroupLine[] = new EditorConversationGroupLine[3];
	}

	private class DialogBox {
		var instance : GameObject;
		var instructions : OGTextField;
		var title : OGTextField;
		var canCancel : OGTickBox;
		var useInput : OGTickBox;
	}

	private class Line {
		var instance : GameObject;
		var condition : OGButton;
		var consequence : OGButton;
		var speaker : OGPopUp;
		var line : OGTextField;
	}
	
	// Public vars
	var index : OGLabel;
	var type : OGPopUp;
	var group : Group;
	var dialogBox : DialogBox;
	var line : Line;
	var groupLinePrefab : EditorConversationGroupLine;


	// Public functions
	function RemoveEntry () {
		Destroy ( this.gameObject );
	}
	
	function MoveUp () {
	
	}
	
	function MoveDown () {
	
	}

	function ShowType ( name : String ) {
		if ( name == "DialogBox" ) {
			dialogBox.instance.SetActive ( true );
			group.instance.SetActive ( false );
			line.instance.SetActive ( false );
			
		} else if ( name == "Group" ) {
			dialogBox.instance.SetActive ( false );
			group.instance.SetActive ( true );
			line.instance.SetActive ( false );
		
		} else if ( name == "Line" ) {
			dialogBox.instance.SetActive ( false );
			group.instance.SetActive ( false );
			line.instance.SetActive ( true );
		
		} else {
			dialogBox.instance.SetActive ( false );
			group.instance.SetActive ( false );
			line.instance.SetActive ( false );
		}
	}

	function SelectedLineAmount () {
		var amount : int = int.Parse ( group.options.selectedOption );
		var activeLines;
		
		for ( var i = 0; i < group.lines.Length; i++ ) {
			if ( amount-1 < i && group.lines[i] != null ) {
				Destroy ( group.lines[i].gameObject );
				group.lines[i] = null;
			
			} else if ( amount-1 >= i && group.lines[i] == null ) {
				group.lines[i] = Instantiate ( groupLinePrefab );
				group.lines[i].transform.parent = group.instance.transform;
				group.lines[i].transform.localPosition =  new Vector3 ( 20, (i+1) * 50, 0 );
				group.lines[i].SetIndex ( i );
				
			}
		}
	}

	////////////////////
	// Init
	////////////////////
	function Start () {
		ShowType ( null );
	}
	
	////////////////////
	// Update
	////////////////////
	function Update () {
		ShowType ( type.selectedOption );
	}
}