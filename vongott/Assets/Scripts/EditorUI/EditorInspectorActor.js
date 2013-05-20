#pragma strict

class EditorInspectorActor extends MonoBehaviour {
	var convoBox : GameObject;
	var convoContainer : Transform;
	var convoPrefab : EditorInspectorConvo;
	var convos : List.< EditorInspectorConvo > = new List.< EditorInspectorConvo >();
	@HideInInspector var convoBottomLine : float = 0;
	
	var stateBox : GameObject;
	var affiliation : OGPopUp;
	var mood : OGPopUp;
	
	var inventoryBox : GameObject;
	var inventorySlots : OGImage[];

	var pathBox : GameObject;
	var nodes : List.< GameObject > = new List.< GameObject >();
	var nodeGizmo : GameObject;
	
	
	//////////////////////
	// Conversation
	//////////////////////		
	// Add convo
	function AddConvo () : EditorInspectorConvo {
		var convo : EditorInspectorConvo = Instantiate ( convoPrefab );
		convos.Add ( convo );
		convo.transform.parent = convoContainer;
		convo.transform.localPosition = new Vector3 ( 0, convoBottomLine, 0 );
		convo.label.text = "Convo" + convos.IndexOf ( convo ).ToString();
		convo.inspector = this.gameObject;
		convo.Init ();
				
		convoBottomLine += 90;
		convoContainer.GetComponent ( OGScrollView ).scrollLength = convoBottomLine;
	
		return convo;
	}
	
	function AddConvoAndUpdate () {
		AddConvo ();
		
		UpdateObject ();
	}
	
	// Remove convo
	function RemoveConvo () {
		convoBottomLine -= 90;
		convoContainer.GetComponent ( OGScrollView ).scrollLength = convoBottomLine;
	
		Destroy ( convos[convos.Count-1].gameObject );
		convos.RemoveAt ( convos.Count-1 );
		
		UpdateObject ();
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
	
	// Clear nodes
	function ClearNodes () {
		for ( var i = 0; i < nodes.Count; i++ ) {
			DestroyImmediate ( nodes[i] );
		}
		
		nodes.Clear ();
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
		node.transform.parent = pathBox.transform;
		node.transform.localPosition = new Vector3 ( 10, 20 + ( 50 * nodes.Count ), 0 );
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
		buttonGrab.transform.localPosition = new Vector3 ( 230, 18, -2 );
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
		buttonRot.transform.localPosition = new Vector3 ( 160, 18, -2 );
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
		idleTime.transform.localPosition = new Vector3 ( 10, 20, -2 );
		idleTime.transform.localScale = Vector3.one;
		
		// ^ input
		var input : GameObject = new GameObject ( "Input" );
		input.transform.parent = idleTime.transform;
		input.transform.localPosition = new Vector3 ( 100, 0, -2 );
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
		itLabel.transform.localPosition = new Vector3 ( 0, 0, -2 );
		itLabel.transform.localScale = new Vector3 ( 100, 20, 0 );
		
		var il : OGLabel = itLabel.AddComponent ( OGLabel );
		il.text = "Delay (seconds)";

		// add node
		nodes.Add ( node );
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
	// Inventory
	//////////////////////
	function ChangeInventorySlot ( num : String ) {
		var i : int = int.Parse ( num );
		
		EditorCore.UnequipItem ( i );
		EditorItems.equipping = i;
		OGRoot.GoToPage ( "Items" );
	}
	
	
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {			
		var a : Actor = obj.GetComponent ( Actor );
		
		// state
		affiliation.selectedOption = a.affiliation;
		mood.selectedOption = a.mood;
		
		// path nodes
		ClearNodes();
		for ( var i = 0; i < a.path.Count; i++ ) {
			AddNodeMenuItem( a.path[i].GetComponent(PathNode).duration );
		}
		
		// conversation
		for ( i = 0; i < a.conversations.Count; i++ ) {
			var c : Conversation = a.conversations[i];
			var convo : EditorInspectorConvo = AddConvo ();
			if ( c.condition ) { convo.condition.text = c.condition; }
			convo.chapter.selectedOption = c.chapter;
			convo.scene.selectedOption = c.scene;
			convo.actorName.selectedOption = c.name;
			convo.conversation.selectedOption = c.conversation;
			
			convo.UpdateAll ();
		}
				
		// inventory
		for ( var s = 0; s < inventorySlots.Length; s++ ) {
			if ( a.inventory[s] ) {
				inventorySlots[s].image = a.inventory[s].image;
			} else {
				inventorySlots[s].image = null;
			}
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
		
			if ( pathBox.activeSelf ) {
				for ( var i = 0; i < a.path.Count; i++ ) {
					var str : String = nodes[i].GetComponentInChildren(OGTextField).text;
					
					if ( str != "" ) {
						a.path[i].GetComponent(PathNode).duration = float.Parse ( str );
					}
				}
			}
		}
	}
	
	function UpdateObject () {
		var o : GameObject = EditorCore.GetSelectedObject();
		
		if ( o.GetComponent ( Actor ) ) {
			var a : Actor = o.GetComponent ( Actor );
						
			a.affiliation = affiliation.selectedOption;
			a.mood = mood.selectedOption;
		
			a.conversations.Clear ();
			for ( var control : EditorInspectorConvo in convoContainer.GetComponentsInChildren(EditorInspectorConvo) ) {
				var c : Conversation = new Conversation ();
				
				c.chapter = control.chapter.selectedOption;
				c.scene = control.scene.selectedOption;
				c.name = control.actorName.selectedOption;
				c.conversation = control.conversation.selectedOption;
				
				a.conversations.Add ( c );
			}
		} 	
	}
}