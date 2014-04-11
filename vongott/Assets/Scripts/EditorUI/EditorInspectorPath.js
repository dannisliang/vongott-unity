#pragma strict

class EditorInspectorPath extends MonoBehaviour {
	var pathContainer : Transform;
	@HideInInspector var pathBottomLine : float = 0;
	var nodes : List.< GameObject > = new List.< GameObject >();
	var addNode : OGButton;
	var pathType : OGPopUp;
	
	
	//////////////////////
	// Path nodes
	//////////////////////
	// Pick path node
	function PickNode ( number : String ) {
		var i : int = int.Parse ( number );
		
		EditorCore.SetPickMode ( true );
	
		EditorCore.pickerCallback = function ( hit : RaycastHit ) {
			EditorCore.GetSelectedObject().GetComponent(Actor).path[i].position = hit.point;
		};
	}
	
	// Clear nodes
	function ClearNodes () {
		for ( var i = 0; i < nodes.Count; i++ ) {
			DestroyImmediate ( nodes[i] );
		}
		
		nodes.Clear ();
		pathBottomLine = 0;
	}
	
	// Remove path node
	function DeleteNode ( number : String ) {		
		var i : int = int.Parse ( number );
		
		if ( nodes.Count < 1 ) {
			return;
		}
		
		// delete UI item
		DestroyImmediate ( nodes[i] );
		nodes.RemoveAt ( i );
		
		// delete actual PathNode
		EditorCore.GetSelectedObject().GetComponent(Actor).path.RemoveAt ( i );
		
		// reinit
		Init ( EditorCore.GetSelectedObject() );
	
		// move add button
		addNode.transform.localPosition = new Vector3 ( 0, pathBottomLine, 0 );
	}
	
	// Create path node
	function AddNodeMenuItem ( actorNode : PathNode ) {		
		// root
		var node : GameObject = new GameObject ( "PathNode" + nodes.Count.ToString() );
		node.transform.parent = pathContainer;
		node.transform.localPosition = new Vector3 ( 0, pathBottomLine, 0 );
		node.transform.localScale = Vector3.one;
		
		// label
		var label : GameObject = new GameObject ( "Label" );
		label.transform.parent = node.transform;
		label.transform.localPosition = new Vector3 ( 0, 0, 0 );
		label.transform.localScale = new Vector3 ( 100, 20, 1 );
		
		var l : OGLabel = label.AddComponent ( OGLabel );
		l.text = "PathNode" + nodes.Count.ToString();
		l.ApplyDefaultStyles();

		// pick node
		var buttonPick : GameObject = new GameObject ( "ButtonPick" );
		buttonPick.transform.parent = node.transform;
		buttonPick.transform.localPosition = new Vector3 ( 190, 47, 0 );
		buttonPick.transform.localScale = new Vector3 ( 70, 20, 0 );
		
		var bp : OGButton = buttonPick.AddComponent ( OGButton );
		bp.text = "Pick";
		bp.target = this.gameObject;
		bp.message = "PickNode";
		bp.argument = nodes.Count.ToString();
		bp.ApplyDefaultStyles();

		// delete node
		var buttonDelete : GameObject = new GameObject ( "ButtonDelete" );
		buttonDelete.transform.parent = node.transform;
		buttonDelete.transform.localPosition = new Vector3 ( 270, 30, 0 );
		buttonDelete.transform.localScale = new Vector3 ( 20, 20, 0 );
		
		var bd : OGButton = buttonDelete.AddComponent ( OGButton );
		bd.text = "-";
		bd.target = this.gameObject;
		bd.message = "DeleteNode";
		bd.argument = nodes.Count.ToString();
		bd.ApplyDefaultStyles();

		// idle time
		var idleTime : GameObject = new GameObject ( "IdleTime" );
		idleTime.transform.parent = node.transform;
		idleTime.transform.localPosition = new Vector3 ( 10, 20, 0 );
		idleTime.transform.localScale = Vector3.one;
		
		// ^ input
		var input : GameObject = new GameObject ( "Input" );
		input.transform.parent = idleTime.transform;
		input.transform.localPosition = new Vector3 ( 60, 0, 0 );
		input.transform.localScale = new Vector3 ( 60, 20, 1 );
		
		var tf : OGTextField = input.AddComponent ( OGTextField );
		tf.text = actorNode.duration.ToString();
		tf.maxLength = 4;
		tf.regex = "^0-9";
		tf.ApplyDefaultStyles();		

		// ^ label
		var itLabel : GameObject = new GameObject ( "Label" );
		itLabel.transform.parent = idleTime.transform;
		itLabel.transform.localPosition = new Vector3 ( 0, 2, 0 );
		itLabel.transform.localScale = new Vector3 ( 100, 20, 0 );
		
		var il : OGLabel = itLabel.AddComponent ( OGLabel );
		il.text = "Idle (s)";
		il.ApplyDefaultStyles();

		// movement
		var running : GameObject = new GameObject ( "Movement" );
		running.transform.parent = node.transform;
		running.transform.localPosition = new Vector3 ( 190, 20, 0 );
		running.transform.localScale = new Vector3 ( 70, 20, 1 );
		
		var rpu : OGPopUp = running.AddComponent ( OGPopUp );
		rpu.title = "<movement>";
		rpu.options = [ "Walk", "Run", "Teleport" ];
		rpu.selectedOption = actorNode.movement.ToString();
		rpu.ApplyDefaultStyles();

		// position
		var posLabel : GameObject = new GameObject ( "Label" );
		posLabel.transform.parent = idleTime.transform;
		posLabel.transform.localPosition = new Vector3 ( 0, 30, 0 );
		posLabel.transform.localScale = new Vector3 ( 100, 20, 0 );
		
		var pl : OGLabel = posLabel.AddComponent ( OGLabel );
		pl.text = "Position:";
		pl.ApplyDefaultStyles();

		// ^ numbers
		var numLabel : GameObject = new GameObject ( "Position" );
		numLabel.transform.parent = idleTime.transform;
		numLabel.transform.localPosition = new Vector3 ( 60, 30, 0 );
		numLabel.transform.localScale = new Vector3 ( 200, 20, 1 );
		
		var nl : OGLabel = numLabel.AddComponent ( OGLabel );
		nl.text = actorNode.position.x.ToString("f2") + ", " + actorNode.position.y.ToString("f2") + ", " + actorNode.position.z.ToString("f2");
		nl.ApplyDefaultStyles();

		// add node
		nodes.Add ( node );
		
		pathBottomLine += 80;
	}
	
	function AddNode () {
		if ( nodes.Count > 7 ) {
			return;
		}
		
		var node : PathNode = new PathNode ();
		node.position = EditorCore.GetSelectedObject().transform.position;
		node.duration = 0;
		
		AddNodeMenuItem ( node );
		
		EditorCore.GetSelectedObject().GetComponent(Actor).path.Add ( node );
		
		addNode.transform.localPosition = new Vector3 ( 0, pathBottomLine, 0 );
	}
		
		
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {			
		var a : Actor = obj.GetComponent ( Actor );
		
		ClearNodes();
		
		pathType.selectedOption = a.pathType.ToString();
		
		for ( var i = 0; i < a.path.Count; i++ ) {
			AddNodeMenuItem( a.path[i] );
		}
		
		addNode.transform.localPosition = new Vector3 ( 0, pathBottomLine, 0 );
	}
	
	
	//////////////////////
	// Update
	//////////////////////
	function Update () {
		var o : GameObject = EditorCore.GetSelectedObject();
		
		if ( !o ) { return; }
		
		if ( o.GetComponent ( Actor ) ) {
			var a : Actor = o.GetComponent ( Actor );		
		
			a.SetPathType ( pathType.selectedOption );
		
			for ( var i = 0; i < a.path.Count; i++ ) {
				var duration : String = nodes[i].GetComponentInChildren(OGTextField).text;
				var movement : String = nodes[i].GetComponentInChildren(OGPopUp).selectedOption;
				
				a.path[i].SetMovement ( movement );
				
				if ( duration != "" ) {
					a.path[i].duration = float.Parse ( duration );
				}
			}
		}
	}
	
	function UpdateObject () {
			
	}
}
