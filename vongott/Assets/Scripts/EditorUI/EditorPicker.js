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
		if ( String.IsNullOrEmpty ( selectedItem ) ) { return; }
		
		button.text = selectedItem;
		
		OGRoot.GetInstance().GoToPage ( sender );
		
		if ( func ) { func (); }
		
		func = null;
		mode = "";
		sender = "";
		button = null;
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GetInstance().GoToPage ( sender );
	
		mode = "";
		sender = "";
		button = null;
	}
	
	// Create button
	function CreateButton ( label : String ) {
		CreateButton ( label, true );
	}
	
	function CreateButton ( label : String, useNesting : boolean ) {
		var obj : GameObject = new GameObject ( scrollView.transform.childCount + ": " + label );
		var btn : OGListItem = obj.AddComponent ( OGListItem );
		
		var split : String [] = label.Split ( "/"[0] );
		var inset : float = 0;
		
		inset = ( split.Length - 1 ) * 20;
		
		btn.text += label;
		btn.target = this.gameObject;
		btn.message = "SelectItem";

		obj.transform.parent = scrollView.transform;
		obj.transform.localPosition = new Vector3 ( inset, 0, 0 );
		obj.transform.localScale = new Vector3 ( 570 - inset, 20, 1 );
	
		btn.GetDefaultStyles ();
	}
	
	// Create line
	function CreateLine ( label : String ) {
		var obj : GameObject = new GameObject ( scrollView.transform.childCount + ": " + label );
		var lbl : OGLabel = obj.AddComponent ( OGLabel );
		
		var split : String [] = label.Split ( "/"[0] );
		var inset : float = 0;

		inset = ( split.Length - 1 ) * 20;
				
		lbl.text += Regex.Replace ( label, "[/]", "" );
		
		obj.transform.parent = scrollView.transform;
		obj.transform.localScale = new Vector3 ( 570 - inset, 20, 1 );
		obj.transform.localPosition = new Vector3 ( inset, 0, 0 );

		lbl.GetDefaultStyles ();
	}
	
	
	// Highlight item
	function SelectItem ( btn : OGListItem ) {
		selectedItem = btn.text;
		
		for ( var i : int = 0; i < scrollView.transform.childCount; i++ ) {
			var b : OGListItem = scrollView.transform.GetChild(i).GetComponent(OGListItem);
			if ( b ) {
				b.isTicked = b == btn;
			}
		}
	}
	
	// Clear items
	function ClearItems () {
		for ( var i = 0; i < scrollView.transform.childCount; i++ ) {
			Destroy ( scrollView.transform.GetChild ( i ).gameObject );
		}
		
		CreateButton ( "(none)" );
	}
	
	// Apply filter
	function ApplyFilter () {
		for ( var i = 0; i < scrollView.transform.childCount; i++ ) {
			var btn : OGListItem = scrollView.transform.GetChild ( i ).gameObject.GetComponent ( OGListItem );
			
			if ( btn.text.Contains ( filter.text ) ) {
				btn.isDisabled = false;
			} else {
				btn.isDisabled = true;
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
	// Sort list
	private function SortList () : IEnumerator {
		yield WaitForEndOfFrame ();
	
		for ( var i = 0; i < scrollView.transform.childCount; i++ ) {
			scrollView.transform.GetChild(i).localPosition = new Vector3 ( scrollView.transform.GetChild(i).localPosition.x, i * 20, 0 );
		}
	
		OGRoot.GetInstance().SetDirty();
	}
	
	// Quests
	private function InitQuests () {
		var allQuests : JSONObject = Loader.LoadQuests();
		
		for ( var obj : Object in allQuests.list ) {
			CreateButton ( (obj as JSONObject).GetField ( "id" ).str );
		}
		
		StartCoroutine ( SortList () );
	}
	
	// Events
	private function InitEvents () {
		var allEvents : JSONObject = Loader.LoadEvents();
		
		for ( var obj : Object in allEvents.list ) {
			CreateButton ( (obj as JSONObject).GetField ( "id" ).str );
		}
		
		StartCoroutine ( SortList () );
	}
	
	// Convos
	private function InitConvos () {		
		for ( var c : String in EditorCore.GetConvoChapters () ) {
			CreateLine ( "chapter " + c );
			
			for ( var s : String in EditorCore.GetConvoScenes ( c ) ) {
				CreateLine ( "/scene " + s );
			
				for ( var i : String in EditorCore.GetConvoTrees ( c, s ) ) {
					CreateButton ( c + "/" + s + "/" + i );
				
				}
			}
		}
		
		StartCoroutine ( SortList () );
	}
	
	// Maps
	private function InitMaps () {
		for ( var name : String in Directory.GetFiles ( Application.dataPath + "/Maps", "*.vgmap" ) ) {
			CreateButton ( EditorCore.TrimFileName ( name ), false );
		}
		
		StartCoroutine ( SortList () );
	}
	
	// Flags
	private function InitFlags () {
		var allFlags : JSONObject = Loader.LoadFlags();
		
		for ( var i = 0; i < allFlags.list.Count; i++ ) {
			CreateButton ( allFlags.keys[i] as String );
		}
		
		StartCoroutine ( SortList () );
	}
	
	// Items
	private function InitItems () {
		var itemsFolder : EditorFileSystem.Folder = EditorFileSystem.resourcesFolder.FindFolder("Items");
		var allConsumables : String[] = itemsFolder.FindFolder("Consumables").GetFileNames();
		var allEquipment : String[] = itemsFolder.FindFolder("Equipment").GetFileNames();
		var allUpgrades : String[] = itemsFolder.FindFolder("Upgrades").GetFileNames();
		var allMisc : String[] = itemsFolder.FindFolder("Misc").GetFileNames();
		
		var currentString : String = "";
		
		for ( currentString in allConsumables ) {
			CreateButton ( "Consumables/" + currentString, false );
		}
		
		for ( currentString in allEquipment ) {
			CreateButton ( "Equipment/" + currentString, false );
		}
		
		for ( currentString in allUpgrades ) {
			CreateButton ( "Upgrades/" + currentString, false );
		}
		
		for ( currentString in allMisc ) {
			CreateButton ( "Misc/" + currentString, false );
		}
		
		StartCoroutine ( SortList () );
	}
	
	// Page
	override function StartPage () {
		ClearItems ();
		
		if ( mode == "" || sender == "" || !button ) {
			Debug.LogError ( "EditorPicker | Not all required parameters set!" );
			return;
		}
		
		title.text = "Pick a " + mode;
		
		switch ( mode ) {
			case "quest":
				InitQuests ();
				break;
		
			case "conversation":
				InitConvos ();
				break;
		
			case "flag":
				InitFlags ();
				break;
		
			case "map":
				InitMaps ();
				break;
				
			case "event":
				InitEvents ();
				break;
				
			case "items":
			case "item":
				InitItems ();
				break;
		
		}
	}
}
