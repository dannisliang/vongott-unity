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
	var inspectorScroll : OGScrollView;
	
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
		EditorCore.LoadFile ( "TestMap" );
	};
	
	// Save file
	var SaveFile : Function = function () {
		EditorCore.SaveFile ( "TestMap" );
	};
	
	// Save file as
	var SaveFileAs : Function = function () {
		Debug.Log ( "Saved file as.." );
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
		topPanelBg.x = 8;
		topPanelBg.y = 8;
		topPanelBg.width = Screen.width - 16;
		topPanelBg.height = 32;
		
		// top panel : file
		fileMenu = new OGDropDown ( "File" );
		fileMenu.Add ( "New", NewFile );
		fileMenu.Add ( "Open", OpenFile );
		fileMenu.Add ( "Save", SaveFile );
		fileMenu.Add ( "Save As..", SaveFileAs );
		fileMenu.Add ( "Import..", ImportFile );
		fileMenu.Add ( "Exit", Exit );
	
		fileMenu.x = 16;
		fileMenu.y = 16;
		
		// top panel : view
		viewMenu = new OGDropDown ( "View" );
		viewMenu.Add ( "Isometric", ToggleIsometric );
		viewMenu.Add ( "Wireframe", ToggleWireframe );
		viewMenu.Add ( "Textured", ToggleTextured );
		
		viewMenu.x = 96;
		viewMenu.y = 16;
	
		// top panel : add menu
		addMenu = new OGDropDown ( "Add" );
		addMenu.Add ( "Light", AddLight );
		addMenu.Add ( "Prefabs", AddPrefabs );
		addMenu.Add ( "Character", AddCharacters );
	
		addMenu.x = 176;
		addMenu.y = 16;
	
		// top panel : editors menu
		editorsMenu = new OGDropDown ( "Editors" );
		editorsMenu.Add ( "Conversations", ConversationEditor );
		editorsMenu.Add ( "Quests", QuestEditor );
		editorsMenu.Add ( "Flags", FlagEditor );
	
		editorsMenu.x = 256;
		editorsMenu.y = 16;
	
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
	
		// inspector : scrollview
		inspectorScroll = new OGScrollView ();
		
		var dudes : OGWidget[] = new OGWidget[20];
		
		for ( var i = 0; i < 20; i++ ) {
			dudes[i] = new OGLabel ( "dude " + i );
			dudes[i].x = 16;
			dudes[i].y = i * 48;
		
			inspectorScroll.Add ( dudes[i] );
		}
		
		inspectorScroll.x = Screen.width - 8 - 128;
		inspectorScroll.y = (Screen.height / 2 ) - 128;
		inspectorScroll.width = 128;
		inspectorScroll.height = 256;
	
		// inspector : add to group
		inspector.Add ( inspectorBg );
		inspector.Add ( inspectorScroll );
	
		// disable by default
		inspector.enabled = false;
	
	
		// add widgets
		OGCore.Add ( topPanel );
		OGCore.Add ( inspector );
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function Update () {
		inspector.enabled = ( EditorCore.GetSelectedObjects().Count == 1 );
	}
}