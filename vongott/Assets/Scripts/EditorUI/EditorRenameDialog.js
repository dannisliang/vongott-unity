#pragma strict

class EditorRenameDialog extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var background : OGRect;
	var title : OGLabel;
	var name : OGTextField;
	var okButton : OGButton;
	var cancelButton : OGButton;

	// Private vars
	private var picked_format : String = "";
	
	
	////////////////////
	// Pick a format
	////////////////////
	// OK
	var ok : Function = function () {
		EditorCore.currentLevel.name = name.text;
		EditorCore.SaveFile ( EditorCore.currentLevel.name );
		OGPageManager.GoToPage ( "BaseMenu" );
	};
	
	// Cancel
	var cancel : Function = function () {
		OGPageManager.GoToPage ( "BaseMenu" );
	};
	
	
	////////////////////
	// Init
	////////////////////
	override function Init () {		
		// background
		background = new OGRect ();
		background.width = 384;
		background.height = 192;
		background.x = ( Screen.width / 2 ) - ( background.width / 2 );
		background.y = ( Screen.height / 2 ) - ( background.height / 2 );
		
		// title
		title = new OGLabel ( "Rename the level" );
		title.x = background.x + 16;
		title.y = background.y + 16;
		title.style.fontStyle = FontStyle.Bold;
		title.style.fontSize = 14;
		
		// text field
		if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
			name = new OGTextField ( "" );
		} else {
			name = new OGTextField ( EditorCore.currentLevel.name );
		}
		name.width = background.width / 2;
		name.height = 32;
		name.x = background.x + ( background.width / 2 ) - ( name.width / 2 );
		name.y = background.y + ( background.height / 2 ) - ( name.height / 2 );
		name.restrictASCII = true;
		name.restrictSpaces = true;
		
		// ok button
		okButton = new OGButton ( "OK", ok );
		okButton.width = 128;
		okButton.height = 32;
		okButton.x = background.x + ( background.width / 2 ) - okButton.width - 8;
		okButton.y = background.y + background.height - 48;
		
		// cancel button
		cancelButton = new OGButton ( "Cancel", cancel );
		cancelButton.width = 128;
		cancelButton.height = 32;
		cancelButton.x = background.x + ( background.width / 2 ) + 8;
		cancelButton.y = okButton.y;
		
		
		// add widgets
		OGCore.Add ( background );
		OGCore.Add ( title );
		OGCore.Add ( name );
		OGCore.Add ( okButton );
		OGCore.Add ( cancelButton );
	}
	
	////////////////////
	// Update
	////////////////////
	override function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGPageManager.GoToPage ( "BaseMenu" );
		}
	}
}