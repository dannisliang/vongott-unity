#pragma strict

class EditorInspectorActor extends MonoBehaviour {
	var convo : OGButton;
	
	var stateBox : GameObject;
	var affiliation : OGPopUp;
	var mood : OGPopUp;
	
	var inventoryBox : GameObject;
	var inventorySlots : OGTexture[];
	
	
	//////////////////////
	// Conversation
	//////////////////////		
	// Pick convo
	public function PickConvo ( btn : OGButton ) {
		EditorPicker.mode = "conversation";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GetInstance().GoToPage ( "Picker" );
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
		OGRoot.GetInstance().GoToPage ( "BrowserWindow" );
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
		if ( !String.IsNullOrEmpty ( a.conversationTree ) ) {
			convo.text = a.conversationTree;
		} else {
			convo.text = "(none)";
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
	function Update () {
		UpdateObject ();
	}
	
	function UpdateObject () {
		var o : GameObject = EditorCore.GetSelectedObject();
		
		if ( o.GetComponent ( Actor ) ) {
			var a : Actor = o.GetComponent ( Actor );
						
			a.SetAffiliation ( affiliation.selectedOption );
			a.SetMood ( mood.selectedOption );
		
			a.conversationTree = convo.text;
		} 	
	}
}