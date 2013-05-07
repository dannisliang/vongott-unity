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
	var buttonRemoveNode : Transform;
	var nodes : List.< GameObject > = new List.< GameObject >();
	var nodeGizmo : GameObject;
	
	
	//////////////////////
	// Conversation
	//////////////////////		
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
	
	
	//////////////////////
	// Path nodes
	//////////////////////
	// Grab path node
	function GrabNode ( number : String ) {
		 var n : int = int.Parse ( number );
		 var actor : Actor = EditorCore.GetSelectedObject().GetComponent(Actor);
		 
		 EditorCore.selectedObject = actor.path[n].gameObject;
		 EditorCore.SetGrabMode ( true );
	}
	
	// Rotate path node
	function RotateNode ( number : String ) {
		 var n : int = int.Parse ( number );
		 var actor : Actor = EditorCore.GetSelectedObject().GetComponent(Actor);
		 
		 EditorCore.selectedObject = actor.path[n].gameObject;
		 EditorCore.SetRotateMode ( true );
	}
	
	// Set button positions
	function SetButtonPos () {
		buttonAddNode.transform.localPosition = new Vector3 ( buttonAddNode.transform.localPosition.x, 150 + ( 50 * (nodes.Count) ), 0 );
		buttonRemoveNode.transform.localPosition = new Vector3 ( buttonRemoveNode.transform.localPosition.x, 150 + ( 50 * (nodes.Count) ), 0 );	
	}
	
	// Clear nodes
	function ClearNodes () {
		for ( var i = 0; i < nodes.Count; i++ ) {
			DestroyImmediate ( nodes[i] );
		}
		
		nodes.Clear ();
		
		SetButtonPos();
	}
	
	// Remove path node
	function RemoveNode () {		
		if ( nodes.Count < 1 ) {
			return;
		}
		
		var i : int = nodes.Count-1;
		
		// delete UI item
		DestroyImmediate ( nodes[i] );
		nodes.RemoveAt ( i );
		
		// delete actual PathNode
		DestroyImmediate ( EditorCore.GetSelectedObject().GetComponent(Actor).path[i].gameObject );
		EditorCore.GetSelectedObject().GetComponent(Actor).path.RemoveAt ( i );
		
		// set button positions
		SetButtonPos();
	}
	
	// Create path node
	function AddNodeMenuItem ( duration ) {
		// root
		var node : GameObject = new GameObject ( "PathNode" + nodes.Count.ToString() );
		node.transform.parent = this.transform;
		node.transform.localPosition = new Vector3 ( 10, 150 + ( 50 * nodes.Count ), 0 );
		node.transform.localScale = Vector3.one;
		
		// label
		var label : GameObject = new GameObject ( "Label" );
		label.transform.parent = node.transform;
		label.transform.localPosition = Vector3.zero;
		label.transform.localScale = new Vector3 ( 100, 20, 0 );
		
		var l : OGLabel = label.AddComponent ( OGLabel );
		l.text = "PathNode" + nodes.Count.ToString();
		
		// grab node
		var buttonGrab : GameObject = new GameObject ( "ButtonGrab" );
		buttonGrab.transform.parent = node.transform;
		buttonGrab.transform.localPosition = new Vector3 ( 230, 0, 0 );
		buttonGrab.transform.localScale = new Vector3 ( 60, 20, 0 );
		
		var bg : OGButton = buttonGrab.AddComponent ( OGButton );
		bg.style = "Button";
		bg.text = "Grab";
		bg.target = this.gameObject;
		bg.message = "GrabNode";
		bg.argument = nodes.Count.ToString();
		
		// rotate node
		var buttonRot : GameObject = new GameObject ( "ButtonRotate" );
		buttonRot.transform.parent = node.transform;
		buttonRot.transform.localPosition = new Vector3 ( 160, 0, 0 );
		buttonRot.transform.localScale = new Vector3 ( 60, 20, 0 );
		
		var br : OGButton = buttonRot.AddComponent ( OGButton );
		br.style = "Button";
		br.text = "Rotate";
		br.target = this.gameObject;
		br.message = "RotateNode";
		br.argument = nodes.Count.ToString();
		
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
		tf.maxLength = 4;
		tf.restrictSpaces = true;
		tf.restrictNumbers = true;

		if ( duration ) {
			tf.text = duration.ToString();
		}

		// ^ label
		var itLabel : GameObject = new GameObject ( "Label" );
		itLabel.transform.parent = idleTime.transform;
		itLabel.transform.localPosition = new Vector3 ( 0, 0, 0 );
		itLabel.transform.localScale = new Vector3 ( 100, 20, 0 );
		
		var il : OGLabel = itLabel.AddComponent ( OGLabel );
		il.text = "Delay (seconds)";

		// add node
		nodes.Add ( node );
	
		// set button positions
		SetButtonPos();
	}
	
	function AddNode () {
		if ( nodes.Count > 7 ) {
			return;
		}
		
		AddNodeMenuItem ( null );
		
		// instantiate and add to actor
		var pathObj : GameObject = Instantiate ( Resources.Load ( "Prefabs/Editor/path_node" ) as GameObject );
		var actObj : GameObject = EditorCore.GetSelectedObject();
		
		pathObj.transform.parent = actObj.transform.parent;
		pathObj.transform.localScale = new Vector3 ( 0.25, 0.25, 0.25 );
		pathObj.transform.localPosition = actObj.transform.localPosition;
		pathObj.GetComponent(PathNode).owner = actObj;
		
		actObj.GetComponent(Actor).path.Add ( pathObj );
	}
	
	
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {			
		var a : Actor = obj.GetComponent ( Actor );
		stateControl.affiliation.selectedOption = a.affiliation;
		stateControl.mood.selectedOption = a.mood;
		
		ClearNodes();
		for ( var i = 0; i < a.path.Count; i++ ) {
			AddNodeMenuItem( a.path[i].GetComponent(PathNode).duration );
		}
		
		var c : Conversation = obj.GetComponent( Conversation );
		convoControl.chapter.selectedOption = c.chapter.ToString();
		convoControl.scene.selectedOption = c.scene.ToString();
		convoControl.name.selectedOption = c.actorName;
	
		convoControl.chapter.options = TrimFileNames ( EditorCore.GetConvoChapters() );
		convoControl.scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( c.scene ) );
		convoControl.name.options = TrimFileNames ( EditorCore.GetConvos ( c.scene, c.chapter ) );
	}
	
	
	//////////////////////
	// Update
	//////////////////////
	function Update () {
		var o : GameObject = EditorCore.GetSelectedObject();
		
		if ( !o ) { return; }
		
		if ( o.GetComponent ( Actor ) ) {
			var a : Actor = o.GetComponent ( Actor );
			//var drawPath : Vector3[] = new Vector3[a.path.Count];
		
		
			for ( var i = 0; i < a.path.Count; i++ ) {
				var str : String = nodes[i].GetComponentInChildren(OGTextField).text;
				
				if ( str != "" ) {
					a.path[i].GetComponent(PathNode).duration = float.Parse ( str );
				}
			
				//drawPath[i] = a.path[i].transform.localPosition;
			}
			
			//EditorCore.drawPath = drawPath;
		}
	}
	
	function UpdateObject () {
		var o : GameObject = EditorCore.GetSelectedObject();
		
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