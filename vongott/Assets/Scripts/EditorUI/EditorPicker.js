#pragma strict

import System.Text.RegularExpressions;

class EditorPicker extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Static vars
	static var mode : String = "";
	static var sender : String = "";
	static var button : OGButton;
	static var func : Function;
	
	// Public vars
	var title : OGLabel;
	var scrollView : OGScrollView;
	var filter : OGTextField;
	
	@HideInInspector var selectedItem : String = "";
	
	
	////////////////////
	// Key functions
	////////////////////
	// Accept
	function Accept () {
		button.text = selectedItem;
		
		OGRoot.GoToPage ( sender );
		
		if ( func ) { func (); }
		
		func = null;
		mode = "";
		sender = "";
		button = null;
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GoToPage ( sender );
	
		mode = "";
		sender = "";
		button = null;
	}
	
	// Create button
	function CreateButton ( label : String ) {
		var obj : GameObject = new GameObject ( label );
		var btn : OGButton = obj.AddComponent ( OGButton );
		
		var split : String [] = label.Split ( "/"[0] );
		
		for ( var i = 0; i < split.Length - 1; i++ ) {
			btn.text += ".         ";
		}
		
		btn.text += label;
		btn.style = "listitem";
		btn.target = this.gameObject;
		btn.message = "SelectItem";
		
		obj.transform.parent = scrollView.transform;
		obj.transform.localPosition = new Vector3 ( 0, scrollView.scrollLength, 0 );
		obj.transform.localScale = new Vector3 ( 570, 20, 1 );
		
		scrollView.scrollLength += 20;
	}
	
	// Create line
	function CreateLine ( label : String ) {
		var obj : GameObject = new GameObject ( label );
		var lbl : OGLabel = obj.AddComponent ( OGLabel );
		
		var split : String [] = label.Split ( "/"[0] );
		
		for ( var i = 0; i < split.Length - 1; i++ ) {
			lbl.text += ".         ";
		}
				
		lbl.text += Regex.Replace ( label, "[/]", "" );
		lbl.style = "listitemdisabled";
		
		obj.transform.parent = scrollView.transform;
		obj.transform.localPosition = new Vector3 ( 0, scrollView.scrollLength, 0 );
		obj.transform.localScale = new Vector3 ( 570, 20, 1 );
		
		scrollView.scrollLength += 20;
	}
	
	// Deselect all
	function DeselectAll () {
		for ( var btn : OGButton in scrollView.transform.GetComponentsInChildren ( OGButton ) ) {
			btn.style = "listitem";		
		}
	}
	
	// Highlight item
	function SelectItem ( btn : OGButton ) {
		DeselectAll ();
		
		var name : String = Regex.Replace ( btn.text, "[. ]", "" );
		selectedItem = name;
		btn.style = "listitemselected";
	}
	
	// Clear items
	function ClearItems () {
		for ( var i = 0; i < scrollView.transform.childCount; i++ ) {
			Destroy ( scrollView.transform.GetChild ( i ).gameObject );
		}
		
		scrollView.scrollLength = 0;
		
		CreateButton ( "(none)" );
	}
	
	// Apply filter
	function ApplyFilter () {
		for ( var i = 0; i < scrollView.transform.childCount; i++ ) {
			var btn : OGButton = scrollView.transform.GetChild ( i ).gameObject.GetComponent ( OGButton );
			
			if ( btn.text.Contains ( filter.text ) ) {
				btn.style = "listitem";
			} else {
				btn.style = "listitemdisabled";
			}
		}
	}
	
	
	////////////////////
	// Update
	////////////////////
	// Page
	override function UpdatePage () {
		if ( Input.GetKeyDown ( KeyCode.Return ) ) {
			Accept ();
		}
	}
	
	////////////////////
	// Init
	////////////////////
	// Quests
	function InitQuests () {
		var allQuests : JSONObject = Loader.LoadQuests();
		
		for ( var obj : JSONObject in allQuests.list ) {
			CreateButton ( obj.GetField ( "id" ).str );
		}
	}
	
	// Convos
	function InitConvos () {		
		for ( var c : String in EditorCore.GetConvoChapters () ) {
			CreateLine ( "chapter " + c );
			
			for ( var s : String in EditorCore.GetConvoScenes ( c ) ) {
				CreateLine ( "/scene " + s );
			
				for ( var n : String in EditorCore.GetConvoNames ( c, s ) ) {
					CreateLine ( "//" + n );
				
					for ( var i : String in EditorCore.GetConvos ( c, s, n ) ) {
						CreateButton ( c + "/" + s + "/" + n + "/" + i );
					
					}
				}
			}
		}
	}
	
	// Flags
	function InitFlags () {
		var allFlags : JSONObject = Loader.LoadFlags();
		
		for ( var i = 0; i < allFlags.list.Count; i++ ) {
			CreateButton ( allFlags.keys[i] );
		}
	}
	
	// Page
	override function StartPage () {
		ClearItems ();
		
		if ( mode == "" || sender == "" || !button ) {
			Debug.LogError ( "EditorPicker | Not all required parameters set!" );
			return;
		}
		
		title.text = "Pick a " + mode;
		
		if ( mode == "quest" ) {
			InitQuests ();
		
		} else if ( mode == "conversation" ) {
			InitConvos ();
		
		} else if ( mode == "flag" ) {
			InitFlags ();
		
		}
	}
}