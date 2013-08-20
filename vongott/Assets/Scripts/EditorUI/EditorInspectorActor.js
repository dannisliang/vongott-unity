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
	
	
	//////////////////////
	// Conversation
	//////////////////////		
	// Add convo
	function AddConvo () : EditorInspectorConvo {
		var convo : EditorInspectorConvo = Instantiate ( convoPrefab );
		convos.Add ( convo );
		convo.transform.parent = convoContainer;
		convo.transform.localPosition = new Vector3 ( 0, convoBottomLine, 0 );
		convo.label.text = convos.IndexOf ( convo ).ToString();
		convo.inspector = this.gameObject;
		convo.Init ();
				
		convoBottomLine += 160;
		convoContainer.GetComponent ( OGScrollView ).scrollLength = convoBottomLine;
	
		return convo;
	}
	
	function AddConvoAndUpdate () {
		AddConvo ();
		
		UpdateObject ();
	}
	
	// Remove convo
	function RemoveConvo () {
		convoBottomLine -= 100;
		convoContainer.GetComponent ( OGScrollView ).scrollLength = convoBottomLine;
	
		Destroy ( convos[convos.Count-1].gameObject );
		convos.RemoveAt ( convos.Count-1 );
		
		UpdateObject ();
	}
	
	function ClearConvos () {
		for ( var i = 0; i < convos.Count; i++ ) {
			Destroy ( convos[i].gameObject );
		}
		
		convos.Clear ();
		convoBottomLine = 0;
		convoContainer.GetComponent ( OGScrollView ).scrollLength = 0;
	}

		
	//////////////////////
	// Inventory
	//////////////////////
	function ChangeInventorySlot ( num : String ) {
		var i : int = int.Parse ( num );
		
		EditorCore.UnequipItem ( i );
		EditorBrowserWindow.rootFolder = "Items";
		EditorBrowserWindow.initMode = "Equip";
		EditorBrowserWindow.argument = i.ToString();
		OGRoot.GoToPage ( "BrowserWindow" );
	}

	//////////////////////
	// Interpretation
	//////////////////////
	// Convo path
	function ReadConvoPath ( path : String ) : Conversation {
		var c : Conversation = new Conversation ();
		var split : String[] = Regex.Split ( path, "/" ); 		
		
		if ( path != "(none)" ) {		
			c.chapter = split[0];
			c.scene = split[1];
			c.name = split[2];
			c.conversation = split[3];
		}
		
		return c;
	}
	
	
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {			
		var a : Actor = obj.GetComponent ( Actor );
		
		// state
		affiliation.selectedOption = a.affiliation.ToString();
		mood.selectedOption = a.mood.ToString();
		
		// conversation
		ClearConvos();
		convoContainer.GetComponent ( OGScrollView ).viewHeight = Screen.height - convoContainer.position.y;
		
		for ( var i = 0; i < a.conversations.Count; i++ ) {
			var c : Conversation = a.conversations[i];
			var convo : EditorInspectorConvo = AddConvo ();
			if ( c.condition ) { convo.condition.text = c.condition; }
			
			if ( c.condition != "" ) { convo.condition.text = c.condition; }
			if ( c.startQuest != "" ) { convo.startQuest.text = c.startQuest; }
			if ( c.endQuest != "" ) { convo.endQuest.text = c.endQuest; }
			convo.conversation.text = c.chapter + "/" + c.scene + "/" + c.name + "/" + c.conversation;
			
			convo.UpdateAll ();
		}
				
		// inventory
		for ( var s = 0; s < inventorySlots.Length; s++ ) {
			if ( a.inventory[s] && a.inventory[s].GetItem() ) {
				var item : Item = a.inventory[s].GetItem();
				inventorySlots[s].image = item.image;
			} else {
				inventorySlots[s].image = null;
			}
		}
	}
	
	
	//////////////////////
	// Update
	//////////////////////
	function UpdateObject () {
		var o : GameObject = EditorCore.GetSelectedObject();
		
		if ( o.GetComponent ( Actor ) ) {
			var a : Actor = o.GetComponent ( Actor );
						
			a.SetAffiliation ( affiliation.selectedOption );
			a.SetMood ( mood.selectedOption );
		
			a.conversations.Clear ();
			
			for ( var i = 0; i < convos.Count; i++ ) {
				var control : EditorInspectorConvo = convos[i];
				var newConvo : Conversation = ReadConvoPath ( control.conversation.text );
				
				newConvo.condition = control.condition.text;
				newConvo.startQuest = control.startQuest.text;
				newConvo.endQuest = control.endQuest.text;
				
				a.conversations.Add ( newConvo );
			}
		} 	
	}
}