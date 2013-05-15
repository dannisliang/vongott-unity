#pragma strict

class EditorConversations extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Private classes
	private class Selector {
		var chapter : OGPopUp;
		var scene : OGPopUp;
		var name : OGPopUp;
	}
	
	// Public vars
	var selector : Selector;
	var entryInstance : EditorConversationEntry;
	var scrollView : OGScrollView;
	
	// Static vars
	static var entries : List.< EditorConversationEntry > = new List.< EditorConversationEntry >();
		
		
	////////////////////
	// Public functions
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

	// Selected chapter
	function SelectedChapter () {
		if ( selector.scene.selectedOption != "" ) {			
			selector.scene.options = TrimFileNames ( EditorCore.GetConvoScenes ( int.Parse ( selector.chapter.selectedOption ) ) );
			
		}
	}
	
	// Selected scene
	function SelectedScene () {
		if ( selector.scene.selectedOption != "" ) {
			selector.name.options = TrimFileNames ( EditorCore.GetConvos ( int.Parse ( selector.chapter.selectedOption ), int.Parse ( selector.scene.selectedOption ) ) );
			
		}
	}
	
	// Selected name
	function SelectedName () {
		if ( selector.name.selectedOption != "" ) {
			ClearEntries ();
			
			var entryList : List.< EditorConversationEntry > = Loader.LoadConversationToEditor ( selector.chapter.selectedOption + "/" + selector.scene.selectedOption + "/" + selector.name.selectedOption );			
			PopulateEntries ( entryList );
		}
	}
	
	// Clear entries
	function ClearEntries () {
		for ( var i = 0; i < scrollView.transform.childCount; i++ ) {
			Destroy ( scrollView.transform.GetChild(i).gameObject );
		}
		
		entries.Clear ();
	}
	
	// Populate entries
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
				
				child.localPosition = new Vector3 ( 0, bottomLine, 0 );
			
				if ( entry.type.selectedOption == "Group" ) {
					for ( var l = 0; l < entry.group.container.childCount; l++ ) {				
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
	
	// Save
	function Save () {	
		if ( selector.chapter.selectedOption == "" || selector.scene.selectedOption == "" || selector.name.selectedOption == "" ) {
			return;
		}
		
		Saver.SaveConversation ( int.Parse(selector.chapter.selectedOption), int.Parse(selector.scene.selectedOption), selector.name.selectedOption, entries );
	}
	
	// Cancel
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
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
		scrollView.viewWidth = Screen.width - 20;
		scrollView.viewHeight = Screen.height - 160;
		
		// Arrange entries
		RearrangeEntries();
	}
}