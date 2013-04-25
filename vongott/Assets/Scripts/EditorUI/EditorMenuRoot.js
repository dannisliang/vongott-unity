#pragma strict

// Init
function Start () {
	var baseMenu : OGPage = new EditorMenuBase();
	var importDialog : OGPage = new EditorImportDialog();
	var conversations : OGPage = new EditorConversations ();
	var prefabs : OGPage = new EditorPrefabs ();
	var characters : OGPage = new EditorCharacters ();

	OGPageManager.Add ( baseMenu, "BaseMenu" );
	OGPageManager.Add ( importDialog, "ImportDialog" );
	OGPageManager.Add ( conversations, "Conversations" );
	OGPageManager.Add ( prefabs, "Prefabs" );
	OGPageManager.Add ( characters, "Characters" );
	
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