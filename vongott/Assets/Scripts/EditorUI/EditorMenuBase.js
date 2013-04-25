#pragma strict

class EditorMenuBase extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Classes
	
	// Public vars
	var topPanel : OGGroup;
	var topPanelBg : OGRect;
	var fileMenu : OGDropDown;
	var viewMenu : OGDropDown;
	var editorsMenu : OGDropDown;
	var addMenu : OGDropDown;
	
	var inspector : OGGroup;
	var inspectorBg : OGRect;
	var inspectorPosition : OGGroup;
	var inspectorPositionTitle : OGLabel;
	var inspectorPositionX : OGLabel;
	var inspectorPositionY : OGLabel;
	var inspectorPositionZ : OGLabel;
	
	var statusBar : OGGroup;
	var statusBarBg : OGRect;
	var statusUpdate : String;
	var objectInfo : OGLabel;
	
	// Private vars
	var unit : int = 32;
	
	////////////////////
	// File menu
	////////////////////
	// New file
	var NewFile : Function = function () 
	{
		Debug.Log ( "Created new file" );
	};
	
	// Open file
	var OpenFile : Function = function () {
		OGPageManager.GoToPage ( "OpenFile" );
	};
		
	// Save file
	var SaveFile : Function = function () {
		if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
			RenameLevel ();
			return;
		}
	
		EditorCore.SaveFile ( EditorCore.currentLevel.name );
	};
	
	// Rename level
	var RenameLevel : Function = function () {
		OGPageManager.GoToPage ( "RenameDialog" );
	};
	
	// Import file
	var ImportFile : Function = function () {
		OGPageManager.GoToPage ( "ImportDialog" );
	};
	
	// Exit editor
	var Exit : Function = function () {
		Debug.Log ( "Exited editor" );
	};
	
	
	////////////////////
	// View menu
	////////////////////
	// Toggle isometric view
	var ToggleIsometric : Function = function () 
	{
		EditorCore.ToggleIsometric();
	};
	
	// Toggle wireframe view
	var ToggleWireframe : Function = function () 
	{
		EditorCore.ToggleWireframe();
	};
	
	// Toggle wireframe view
	var ToggleTextured : Function = function () 
	{
		EditorCore.ToggleTextured();
	};
	
	
	////////////////////
	// Editors menu
	////////////////////
	// Conversation editor
	var ConversationEditor : Function = function () {
		OGPageManager.GoToPage ( "Conversations" );
	};
	
	// Quest editor
	var QuestEditor : Function = function () {
		OGPageManager.GoToPage ( "Quests" );
	};
	
	// Flag editor
	var FlagEditor : Function = function () {
		OGPageManager.GoToPage ( "Flags" );
	};
	
	
	////////////////////
	// Add menu
	////////////////////
	// Prefabs
	var AddPrefabs : Function = function () 
	{
		OGPageManager.GoToPage ( "Prefabs" );
	};
	
	var AddCharacters : Function = function () 
	{
		OGPageManager.GoToPage ( "Characters" );
	};
	
	var AddLight : Function = function () 
	{
		EditorCore.AddLight ();
	};
	
	
	////////////////////
	// Init
	////////////////////
	override function Init () {	
		// top panel
		topPanel = new OGGroup ();

		// top panel : background
		topPanelBg = new OGRect ();
		topPanelBg.x = -8;
		topPanelBg.y = -8;
		topPanelBg.width = Screen.width + 16;
		topPanelBg.height = 32;
		
		// top panel : file
		fileMenu = new OGDropDown ( "File" );
		fileMenu.Add ( "New", NewFile );
		fileMenu.Add ( "Open", OpenFile );
		fileMenu.Add ( "Save", SaveFile );
		fileMenu.Add ( "Rename..", RenameLevel );
		fileMenu.Add ( "Import..", ImportFile );
		fileMenu.Add ( "Exit", Exit );
	
		fileMenu.x = 16;
		fileMenu.y = 6;
		
		// top panel : view
		viewMenu = new OGDropDown ( "View" );
		viewMenu.Add ( "Isometric", ToggleIsometric );
		viewMenu.Add ( "Wireframe", ToggleWireframe );
		viewMenu.Add ( "Textured", ToggleTextured );
		
		viewMenu.x = 96;
		viewMenu.y = 6;
	
		// top panel : add menu
		addMenu = new OGDropDown ( "Add" );
		addMenu.Add ( "Light", AddLight );
		addMenu.Add ( "Prefabs", AddPrefabs );
		addMenu.Add ( "Character", AddCharacters );
	
		addMenu.x = 176;
		addMenu.y = 6;
	
		// top panel : editors menu
		editorsMenu = new OGDropDown ( "Editors" );
		editorsMenu.Add ( "Conversations", ConversationEditor );
		editorsMenu.Add ( "Quests", QuestEditor );
		editorsMenu.Add ( "Flags", FlagEditor );
	
		editorsMenu.x = 256;
		editorsMenu.y = 6;
	
		// top panel : add to group
		topPanel.Add ( topPanelBg );
		topPanel.Add ( fileMenu );
		topPanel.Add ( viewMenu );
		topPanel.Add ( addMenu );
		topPanel.Add ( editorsMenu );
		
	
		// inspector
		inspector = new OGGroup();
		
		// inspector : background
		inspectorBg = new OGRect ();
		inspectorBg.x = Screen.width - 8 - 128;
		inspectorBg.y = ( Screen.height / 2 ) - 128;
		inspectorBg.width = 128;
		inspectorBg.height = 256;
	
		// inspector : position
		inspectorPosition = new OGGroup();
		
		// inspector : position : title
		inspectorPositionTitle = new OGLabel( "Position" );
		inspectorPositionTitle.x = inspectorBg.x + 8;
		inspectorPositionTitle.y = inspectorBg.y + 8;
		
		// inspector : position : x
		inspectorPositionX = new OGLabel ( "" );
		inspectorPositionX.x = inspectorBg.x + unit / 2;
		inspectorPositionX.y = inspectorBg.y + unit;
	
		// inspector : position : y
		inspectorPositionY = new OGLabel ( "" );
		inspectorPositionY.x = inspectorPositionX.x;
		inspectorPositionY.y = inspectorPositionX.y + unit / 2;
	
		// inspector : position : z
		inspectorPositionZ = new OGLabel ( "" );
		inspectorPositionZ.x = inspectorPositionY.x;
		inspectorPositionZ.y = inspectorPositionY.y + unit / 2;
	
		// inspector : position : add group
		inspectorPosition.Add ( inspectorPositionTitle );
		inspectorPosition.Add ( inspectorPositionX );
		inspectorPosition.Add ( inspectorPositionY );
		inspectorPosition.Add ( inspectorPositionZ );
	
		// inspector : add to group
		inspector.Add ( inspectorBg );
		inspector.Add ( inspectorPosition );
	
		
		// status bar
		statusBar = new OGGroup();
	
		// status bar : background;
		statusBarBg = new OGRect ();
		statusBarBg.x = 8;
		statusBarBg.y = Screen.height - 32;
		statusBarBg.width = Screen.width - 16;
		statusBarBg.height = 24;
		
		// status bar : info
		objectInfo = new OGLabel ( "info here" );
		objectInfo.x = statusBarBg.x + 8;
		objectInfo.y = statusBarBg.y + 6;
		
		// status bar : add to group
		statusBar.Add ( statusBarBg );
		statusBar.Add ( objectInfo );
		
	
		// disabled by default
		inspector.enabled = false;
	
		// add widgets
		OGCore.Add ( topPanel );
		OGCore.Add ( inspector );
		OGCore.Add ( statusBar );
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function Update () {
		var count = EditorCore.GetSelectedObjects().Count;
		
		if ( count <= 0 ) {
			inspector.enabled = false;
			if ( statusUpdate != "" ) {
				objectInfo.text = statusUpdate;
			} else {
				objectInfo.text = EditorCore.currentLevel.name;
			}
		
		} else {
			inspector.enabled = true;
			objectInfo.text = EditorCore.GetSelectedObjects()[count-1].name;
		
			inspectorPositionX.text = "X: " + EditorCore.GetSelectedObjects()[count-1].transform.localPosition.x.ToString();
			inspectorPositionY.text = "Y: " + EditorCore.GetSelectedObjects()[count-1].transform.localPosition.y.ToString();
			inspectorPositionZ.text = "Z: " + EditorCore.GetSelectedObjects()[count-1].transform.localPosition.z.ToString();
		}
	}
}