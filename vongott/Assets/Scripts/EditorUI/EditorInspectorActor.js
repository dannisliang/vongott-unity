#pragma strict

private class ConvoControl {
	var chapter : OGPopUp;
	var scene : OGPopUp;
	var name : OGPopUp;
}

private class StateControl {
	var affiliation : OGPopUp;
	var mood : OGPopUp;
}

class EditorInspectorActor extends MonoBehaviour {
	var convoControl : ConvoControl;
	var stateControl : StateControl;
	var buttonAddNode : Transform;
	var nodes : List.< GameObject> = new List.< GameObject >();
			
	// Trim filename
	function TrimFileNames ( paths : String[] ) : String[] {
		var newArray : String[] = new String[paths.Length];
		
		for ( var i = 0; i < paths.Length; i++ ) {
			var path = paths[i].Split("\\"[0]);
			var fileName = path[path.Length-1];
			var extention = fileName.Split("."[0]);
			var name = extention[0];
			newArray[i] = name;
		}
		
		return newArray;
	}
	
	// Selected chapter
	function SelectedChapter () {
		if ( convoControl.scene.selectedOption != "<c>" ) {
			convoControl.scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( int.Parse ( convoControl.chapter.selectedOption ) ) );
			UpdateObject ();
		}
	}
	
	// Selected scene
	function SelectedScene () {
		if ( convoControl.scene.selectedOption != "<s>" ) {
			convoControl.name.options = TrimFileNames ( EditorCore.GetConvos ( int.Parse ( convoControl.chapter.selectedOption ), int.Parse ( convoControl.scene.selectedOption ) ) );
			UpdateObject ();
		}
	}
	
	// Selected name
	function SelectedName () {
		if ( convoControl.name.selectedOption != "<name>" ) {
			UpdateObject ();
		}
	}
	
	// Create path node
	function AddNode () {
		// root
		var node : GameObject = new GameObject ( "PathNode" + nodes.Count.ToString() );
		node.transform.parent = this.transform;
		node.transform.localPosition = new Vector3 ( 10, 130 + ( 50 * nodes.Count ), 0 );
		node.transform.localScale = Vector3.one;
		
		// button
		var button : GameObject = new GameObject ( "ButtonRemove" );
		button.transform.parent = node.transform;
		button.transform.localPosition = new Vector3 ( 270, 0, 0 );
		button.transform.localScale = new Vector3 ( 20, 20, 0 );
		
		var b : OGButton = button.AddComponent ( OGButton );
		b.style = "Button";
		b.text = "-";
		b.target = this.gameObject;
		b.message = "RemoveNode";
		b.argument = (nodes.Count+1).ToString();

		// label
		var label : GameObject = new GameObject ( "Label" );
		label.transform.parent = node.transform;
		label.transform.localPosition = Vector3.zero;
		label.transform.localScale = new Vector3 ( 100, 20, 0 );
		
		var l : OGLabel = label.AddComponent ( OGLabel );
		l.text = "PathNode" + nodes.Count.ToString();
		
		// idle time
		var idleTime : GameObject = new GameObject ( "IdleTime" );
		idleTime.transform.parent = node.transform;
		idleTime.transform.localPosition = new Vector3 ( 10, 20, 0 );
		idleTime.transform.localScale = Vector3.one;
		
		// ^ input
		var input : GameObject = new GameObject ( "Input" );
		input.transform.parent = idleTime.transform;
		input.transform.localPosition = new Vector3 ( 100, 0, 0 );
		input.transform.localScale = new Vector3 ( 100, 20, 1 );

		var tf : OGTextField = input.AddComponent ( OGTextField );
		tf.text = "0";
		tf.maxLength = 6;
		tf.restrictSpaces = true;
		tf.restrictNumbers = true;

		// ^ label
		var itLabel : GameObject = new GameObject ( "Label" );
		itLabel.transform.parent = idleTime.transform;
		itLabel.transform.localPosition = Vector3.zero;
		itLabel.transform.localScale = new Vector3 ( 100, 20, 0 );
		
		var il : OGLabel = label.AddComponent ( OGLabel );
		il.text = "PathNode" + nodes.Count.ToString();

		// add node
		nodes.Add ( node );
	
		buttonAddNode.transform.localPosition = new Vector3 ( buttonAddNode.transform.localPosition.x, 180 + ( 50 * (nodes.Count-1) ), 0 );
	}
	
	// Init
	function Init ( obj : GameObject ) {			
		var a : Actor = obj.GetComponent ( Actor );
		stateControl.affiliation.selectedOption = a.affiliation;
		stateControl.mood.selectedOption = a.mood;
		
		var c : Conversation = obj.GetComponent( Conversation );
		convoControl.chapter.selectedOption = c.chapter.ToString();
		convoControl.scene.selectedOption = c.scene.ToString();
		convoControl.name.selectedOption = c.actorName;
	
		convoControl.chapter.options = TrimFileNames ( EditorCore.GetConvoChapters() );
		convoControl.scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( c.scene ) );
		convoControl.name.options = TrimFileNames ( EditorCore.GetConvos ( c.scene, c.chapter ) );
	}
	
	// Update
	function UpdateObject () {
		for ( var o : GameObject in EditorCore.GetSelectedObjects() ) {
			if ( o.GetComponent ( Actor ) ) {
				var a : Actor = o.GetComponent ( Actor );
				
				a.affiliation = stateControl.affiliation.selectedOption;
				a.mood = stateControl.mood.selectedOption;
			} 
			
			if ( o.GetComponent ( Conversation ) ) {
				var c : Conversation = o.GetComponent ( Conversation );
				
				c.chapter = int.Parse ( convoControl.chapter.selectedOption );
				c.scene = int.Parse ( convoControl.scene.selectedOption );
				c.actorName = convoControl.name.selectedOption;
			}
		}
		
		
	}
}