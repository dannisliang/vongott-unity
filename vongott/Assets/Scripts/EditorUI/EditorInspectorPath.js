#pragma strict

class EditorInspectorPath extends MonoBehaviour {
	var pathContainer : Transform;
	@HideInInspector var pathBottomLine : float = 0;
	var nodes : List.< GameObject > = new List.< GameObject >();
	var nodeGizmo : GameObject;
	
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
	
	// Clear nodes
	function ClearNodes () {
		for ( var i = 0; i < nodes.Count; i++ ) {
			DestroyImmediate ( nodes[i] );
		}
		
		nodes.Clear ();
		pathBottomLine = 0;
		pathContainer.GetComponent ( OGScrollView ).scrollLength = 0;
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
	}
	
	// Create path node
	function AddNodeMenuItem ( duration ) {
		// root
		var node : GameObject = new GameObject ( "PathNode" + nodes.Count.ToString() );
		node.transform.parent = pathContainer;
		node.transform.localPosition = new Vector3 ( 0, pathBottomLine, 0 );
		node.transform.localScale = Vector3.one;
		
		// label
		var label : GameObject = new GameObject ( "Label" );
		label.transform.parent = node.transform;
		label.transform.localPosition = new Vector3 ( 0, 0, -2 );
		label.transform.localScale = new Vector3 ( 100, 20, 1 );
		
		var l : OGLabel = label.AddComponent ( OGLabel );
		l.text = "PathNode" + nodes.Count.ToString();
		
		// grab node
		var buttonGrab : GameObject = new GameObject ( "ButtonGrab" );
		buttonGrab.transform.parent = node.transform;
		buttonGrab.transform.localPosition = new Vector3 ( 220, 20, -2 );
		buttonGrab.transform.localScale = new Vector3 ( 70, 20, 0 );
		
		var bg : OGButton = buttonGrab.AddComponent ( OGButton );
		bg.text = "Grab";
		bg.target = this.gameObject;
		bg.message = "GrabNode";
		bg.argument = nodes.Count.ToString();
		
		// rotate node
		var buttonRot : GameObject = new GameObject ( "ButtonRotate" );
		buttonRot.transform.parent = node.transform;
		buttonRot.transform.localPosition = new Vector3 ( 140, 20, -2 );
		buttonRot.transform.localScale = new Vector3 ( 70, 20, 0 );
		
		var br : OGButton = buttonRot.AddComponent ( OGButton );
		br.text = "Rotate";
		br.target = this.gameObject;
		br.message = "RotateNode";
		br.argument = nodes.Count.ToString();
		
		// idle time
		var idleTime : GameObject = new GameObject ( "IdleTime" );
		idleTime.transform.parent = node.transform;
		idleTime.transform.localPosition = new Vector3 ( 10, 20, -2 );
		idleTime.transform.localScale = Vector3.one;
		
		// ^ input
		var input : GameObject = new GameObject ( "Input" );
		input.transform.parent = idleTime.transform;
		input.transform.localPosition = new Vector3 ( 50, 0, -2 );
		input.transform.localScale = new Vector3 ( 70, 20, 1 );
		
		var tf : OGTextField = input.AddComponent ( OGTextField );
		tf.text = "0";
		tf.maxLength = 4;
		tf.regex = "^0-9";

		if ( duration ) {
			tf.text = duration.ToString();
		}

		// ^ label
		var itLabel : GameObject = new GameObject ( "Label" );
		itLabel.transform.parent = idleTime.transform;
		itLabel.transform.localPosition = new Vector3 ( 0, 2, -2 );
		itLabel.transform.localScale = new Vector3 ( 100, 20, 0 );
		
		var il : OGLabel = itLabel.AddComponent ( OGLabel );
		il.text = "Idle (s)";

		// add node
		nodes.Add ( node );
		
		pathBottomLine += 60;
		pathContainer.GetComponent ( OGScrollView ).scrollLength = pathBottomLine;
		
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
		
		ClearNodes();
		
		pathContainer.GetComponent ( OGScrollView ).viewHeight = Screen.height - pathContainer.position.y;
		for ( var i = 0; i < a.path.Count; i++ ) {
			AddNodeMenuItem( a.path[i].GetComponent(PathNode).duration );
		}
		
	}
	
	
	//////////////////////
	// Update
	//////////////////////
	function Update () {
		var o : GameObject = EditorCore.GetSelectedObject();
		
		if ( !o ) { return; }
		
		if ( o.GetComponent ( Actor ) ) {
			var a : Actor = o.GetComponent ( Actor );		
		
			for ( var i = 0; i < a.path.Count; i++ ) {
				var str : String = nodes[i].GetComponentInChildren(OGTextField).text;
				
				if ( str != "" ) {
					a.path[i].GetComponent(PathNode).duration = float.Parse ( str );
				}
			}
		}
	}
	
	function UpdateObject () {
			
	}
}