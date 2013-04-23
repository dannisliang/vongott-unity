#pragma strict

// Init
function Start () {
	var baseMenu : OGPage = new EditorMenuBase();
	var importDialog : OGPage = new EditorImportDialog();

	OGPageManager.Add ( baseMenu, "BaseMenu" );
	OGPageManager.Add ( importDialog, "ImportDialog" );
	
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