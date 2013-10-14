#pragma strict

class EditorConversationEntry extends MonoBehaviour {
	////////////////////
	// Prerequisites
	////////////////////
	// Public classes	
	class Group {
		var groupType : OGPopUp;
		var condition : OGButton;
		var conditionBool : OGTickBox;
		var instance : GameObject;
		var options : OGPopUp;
		var container : Transform;
		var speaker : OGPopUp;
	}

	class DialogBox {
		var instance : GameObject;
		var instructions : OGTextField;
		var title : OGTextField;
		var canCancel : OGTickBox;
		var useInput : OGTickBox;
	}

	class Line {
		var instance : GameObject;
		var condition : OGButton;
		var conditionBool : OGTickBox;
		var consequence : OGButton;
		var consequenceBool : OGTickBox;
		var speaker : OGPopUp;
		var line : OGTextField;
		var endConvo : OGPopUp;
		var gameEvent : OGButton;
	}
	
	// Public vars
	var index : OGLabel;
	var type : OGPopUp;
	var group : Group;
	var dialogBox : DialogBox;
	var line : Line;
	var groupLinePrefab : EditorConversationGroupLine;
	var buttonNewAbove : OGButton;
	var buttonNewBelow : OGButton;
	var buttonMoveUp : OGButton;
	var buttonMoveDown : OGButton;
	

	// Public functions
	function RemoveEntry () {
		EditorConversations.RemoveEntry ( this );
	}
	
	public function PickEvent ( btn : OGButton ) {
		EditorPicker.mode = "event";				
		EditorPicker.sender = "Conversations";
		EditorPicker.button = btn;
		
		OGRoot.GoToPage ( "Picker" );
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

	// Group
	function SelectedLineAmount () {
		var amount : int = int.Parse ( group.options.selectedOption );
		var difference : int = 0;
							
		if ( amount > group.container.childCount ) {
			difference = amount - group.container.childCount;
			
			for ( var x = 0; x < difference; x++ ) {
				var groupLine : EditorConversationGroupLine = Instantiate ( groupLinePrefab );
				groupLine.transform.parent = group.container;
			}
		
		} else if ( amount < group.container.childCount ) {
			difference = group.container.childCount - amount;
			
			for ( var y = 0; y < difference; y++ ) {
				Destroy ( group.container.GetChild(group.container.childCount-1).gameObject );
			}
		
		}
		
		// Rearrange lines
		for ( var i = 0; i < group.container.childCount; i++ ) {
			var child : Transform = group.container.GetChild ( i );
			var line : EditorConversationGroupLine = child.gameObject.GetComponent( EditorConversationGroupLine );
			
			child.localPosition = new Vector3 ( 20, (i+1) * 50, 0 );
			line.SetIndex ( i );
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
		
		buttonNewAbove.argument = index.text;
		buttonNewBelow.argument = index.text;
		buttonMoveUp.argument = index.text;
		buttonMoveDown.argument = index.text;
		
		// Manage tickboxes
		if ( group.condition.text == "(none)" ) { group.conditionBool.isChecked = false; }
		if ( line.condition.text == "(none)" ) { line.conditionBool.isChecked = false; }
		if ( line.consequence.text == "(none)" ) { line.consequenceBool.isChecked = false; }
	}
}