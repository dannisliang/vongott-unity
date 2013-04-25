#pragma strict

// Init
function Start () {
	var baseMenu : OGPage = new EditorMenuBase();
	var importDialog : OGPage = new EditorImportDialog();
	var renameDialog : OGPage = new EditorRenameDialog();
	var conversations : OGPage = new EditorConversations ();
	var prefabs : OGPage = new EditorPrefabs ();
	var characters : OGPage = new EditorCharacters ();
	var openFile : OGPage = new EditorOpenFile ();

	OGPageManager.Add ( baseMenu, "BaseMenu" );
	OGPageManager.Add ( importDialog, "ImportDialog" );
	OGPageManager.Add ( renameDialog, "RenameDialog" );
	OGPageManager.Add ( conversations, "Conversations" );
	OGPageManager.Add ( prefabs, "Prefabs" );
	OGPageManager.Add ( characters, "Characters" );
	OGPageManager.Add ( openFile, "OpenFile" );
	
	OGPageManager.GoToPage ( "BaseMenu" );
}

// Update
function Update () {
	if ( EditorCore.menusActive ) {
		OGCore.Update ();
	}
}

// Draw
function OnGUI () {
	if ( EditorCore.menusActive ) {
		OGCore.DrawWidgets ();
	}
}