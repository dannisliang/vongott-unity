#pragma strict

class EditorConversations extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Private classes
	private class Selector {
		var instance : GameObject;
		var chapter : OGPopUp;
		var scene : OGPopUp;
		var name : OGPopUp;
		var conversation : OGPopUp;
	}
	
	private class Creator {
		var instance : GameObject;
		var chapter : OGTextField;
		var scene : OGTextField;
		var name : OGTextField;
		var conversation : OGTextField;
	}
	
	private class ConvoInfo {
		var chapter : String = "";
		var scene : String = "";
		var name : String = "";
		var conversation : String = "";
	}
	
	// Public vars
	var selector : Selector;
	var creator : Creator;
	var entryInstance : EditorConversationEntry;
	var scrollView : OGScrollView;
	var currentConvoLabel : OGLabel;
	
	@HideInInspector var currentConvo : ConvoInfo = new ConvoInfo();
	
	// Static vars
	static var entries : List.< EditorConversationEntry > = new List.< EditorConversationEntry >();
		
	////////////////////
	// File I/O
	////////////////////
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

	// Selected chapter, scene and name
	function SelectedChapter () {		
		selector.scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( selector.chapter.selectedOption ) );
	}
	
	function SelectedScene () {
		selector.name.options = TrimFileNames ( EditorCore.GetConvoNames ( selector.chapter.selectedOption, selector.scene.selectedOption ) );
	}
	
	function SelectedName () {
		selector.conversation.options = TrimFileNames ( EditorCore.GetConvos ( selector.chapter.selectedOption, selector.scene.selectedOption, selector.name.selectedOption ) );
	}
	
	function SelectedConversation () {
		
	}
	
	// Update convo info
	function UpdateConvoInfo () {
		currentConvoLabel.text = ": " + currentConvo.chapter + "/" + currentConvo.scene + "/" + currentConvo.name + "/" + currentConvo.conversation;
	}
	
	// Is editor empty?
	function IsEmpty () : boolean {
		return ( entries.Count <= 0 || ( currentConvo.chapter == "" && currentConvo.scene == "" && currentConvo.name == "" ) );
	}
	
	
	// Create convo
	function ForceCreate () {
		selector.chapter.selectedOption = creator.chapter.text;
		selector.scene.selectedOption = creator.scene.text;
		selector.name.selectedOption = creator.name.text;
		selector.conversation.selectedOption = creator.conversation.text;
		
		currentConvo.chapter = selector.chapter.selectedOption;
		currentConvo.scene = selector.scene.selectedOption;
		currentConvo.name = selector.name.selectedOption;
		currentConvo.conversation = selector.conversation.selectedOption;
		
		Save ();
		LoadConversation ();
		
		SelectedChapter ();
		SelectedScene ();
	}
	
	function Create () {
		if ( creator.chapter.text == "" || creator.chapter.text == "chapter" ) { return; }
		if ( creator.scene.text == "" || creator.scene.text == "scene" ) { return; }
		if ( creator.name.text == "" || creator.name.text == "name" ) { return; }
		if ( creator.conversation.text == "" || creator.conversation.text == "conversation" ) { return; }
		
		if ( !IsEmpty() ) {
			SaveChangesDialog ( function () {
				Save();
				ForceCreate ();
			} );
			
		} else {
			ForceCreate ();
			
		}
	}
	
	// Save changes
	function SaveChangesDialog ( func : Function ) {
		OGRoot.GoToPage ( "ConfirmDialog" );
		EditorConfirmDialog.message = "Save your changes first?";
		EditorConfirmDialog.sender = "Conversations";
		EditorConfirmDialog.noAction = LoadConversation;
		EditorConfirmDialog.yesAction = func;
	}
	
	// Load convo
	function LoadSelection () {
		if ( selector.chapter.selectedOption == "" || selector.chapter.selectedOption == "<chapter>" ) { return; }
		if ( selector.scene.selectedOption == "" || selector.scene.selectedOption == "<scene>" ) { return; }
		if ( selector.name.selectedOption == "" || selector.name.selectedOption == "<name>" ) { return; }
		if ( selector.conversation.selectedOption == "" || selector.conversation.selectedOption == "<conversation>" ) { return; }
				
		if ( !IsEmpty() ) {
			SaveChangesDialog ( function () {
				Save();
				LoadConversation();
			} );
		
		} else {
			LoadConversation();
		
		}
	}
	
	function LoadConversation () {
		ClearEntries ();
			
		var entryList : List.< EditorConversationEntry > = Loader.LoadConversationToEditor ( selector.chapter.selectedOption + "/" + selector.scene.selectedOption + "/" + selector.name.selectedOption + "/" + selector.conversation.selectedOption );			
		PopulateEntries ( entryList );
	
		currentConvo.chapter = selector.chapter.selectedOption;
		currentConvo.scene = selector.scene.selectedOption;
		currentConvo.name = selector.name.selectedOption;
		currentConvo.conversation = selector.conversation.selectedOption;

		UpdateConvoInfo ();
	}
	
	
	// Save
	function Save () {	
		Saver.SaveConversation ( currentConvo.chapter, currentConvo.scene, currentConvo.name, currentConvo.conversation, entries );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	
	////////////////////
	// Entry arrangement
	////////////////////
	// Set flag
	function SetFlag ( btn : OGButton ) {
		EditorPickFlag.target = btn;
		EditorPickFlag.sender = "Conversations";
		OGRoot.GoToPage ( "PickFlag" );
	}
	
	// Clear and populate entries
	function ClearEntries () {
		for ( var i = 0; i < scrollView.transform.childCount; i++ ) {
			Destroy ( scrollView.transform.GetChild(i).gameObject );
		}
		
		entries.Clear ();
		
		scrollView.position = Vector2.zero;
	}
	
	function PopulateEntries ( e : List.< EditorConversationEntry > ) {
		for ( var entry : EditorConversationEntry in e ) {
			AddEntry ( entry );
		}
	}
	
	// Rearrange entries
	function RearrangeEntries () {
		var bottomLine : float = 0;
		
		for ( var i = 0; i < entries.Count; i++ ) {
			if ( entries[i] ) {
				var child : Transform = entries[i].transform;
				var entry = entries[i];
				
				entry.gameObject.name = i.ToString();
				entry.index.text = i.ToString();
				
				entry.buttonNewAbove.target = this.gameObject;
				entry.buttonNewBelow.target = this.gameObject;
				entry.buttonMoveUp.target = this.gameObject;
				entry.buttonMoveDown.target = this.gameObject;
				entry.line.condition.target = this.gameObject;
				entry.line.consequence.target = this.gameObject;
				
				child.localPosition = new Vector3 ( 0, bottomLine, 0 );
			
				if ( entry.type.selectedOption == "Group" ) {
					for ( var l = 0; l < entry.group.container.childCount; l++ ) {				
						entry.group.container.GetChild ( l ).GetComponent ( EditorConversationGroupLine ).consequence.target = this.gameObject;
						
						if ( l == 0 ) {
							bottomLine += 25;
						} else {
							bottomLine += 50;
						}
					}
				}
				
				bottomLine += 100;
			}
		}
		
		scrollView.scrollLength = bottomLine;
	}
	
	// Insert entry
	function InsertEntry ( at : int ) {
		var entry : EditorConversationEntry = NewEntry ( null );
		
		entries.Insert ( at, entry );
	}
	
	// Add entry
	function AddEntry ( entry : EditorConversationEntry ) {
		entries.Add ( entry );
		
		entry.transform.parent = scrollView.transform;
		entry.transform.localScale = Vector3.one;
	}
	
	// New entry
	function NewAbove ( str : String ) {
		var index : int = int.Parse ( str );
	
		InsertEntry ( index );
	}
	
	function NewBelow ( str : String ) {
		var index : int = int.Parse ( str );
	
		InsertEntry ( index + 1 );
	}
	
	function NewEntry ( mode : String ) {
		var entry : EditorConversationEntry = Instantiate ( entryInstance );
		
		entry.transform.parent = scrollView.transform;
		
		if ( mode == "AutoIndex" ) {
			entries.Add ( entry );
			entry.index.text = entries.IndexOf(entry).ToString();
			entry.gameObject.name = entry.index.text;
		}
		
		return entry;
	}
	
	// Move entry
	function MoveUp ( str : String ) {
		var index : int = int.Parse ( str );
		
		if ( index < 1 ) { return; }
		
		var entry = entries[index];
		
		entries.Remove ( entry );
		entries.Insert ( index - 1, entry );
	}
	
	function MoveDown ( str : String ) {
		var index : int = int.Parse ( str );
		
		if ( index >= entries.Count-1 ) { return; }
		
		var entry = entries[index];
		
		entries.Remove ( entry );
		entries.Insert ( index + 1, entry );
	}
	
	// Remove line
	static function RemoveEntry ( entry : EditorConversationEntry ) {
		entries.Remove ( entry );
		Destroy ( entry.gameObject );
	}
		
	
	////////////////////
	// Init
	////////////////////	
	override function StartPage () {
		// List chapters
		selector.chapter.options = TrimFileNames ( EditorCore.GetConvoChapters() );
	}
	
	
	////////////////////
	// Update
	////////////////////	
	override function UpdatePage () {
		// Resize scroll view
		scrollView.viewWidth = Screen.width - 30;
		scrollView.viewHeight = Screen.height - 170;
		
		// Arrange entries
		RearrangeEntries();
	}
}