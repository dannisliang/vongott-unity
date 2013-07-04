#pragma strict

private class VectorDisplay {
	var x : OGLabel;
	var y : OGLabel;
	var z : OGLabel;
}

class EditorMenuBase extends OGPage {	
	////////////////////
	// Public vars
	////////////////////
	var objectName : OGTextField;
	var levelName : OGLabel;
	
	var inspector : GameObject;
	var inspectorMenus : GameObject[];
	
	var pos : VectorDisplay;
	var rot : VectorDisplay;
	var scl : VectorDisplay;
	
	var tabs : OGTabs;
	
	var initName : boolean = false;
	
	
	////////////////////
	// File menu
	////////////////////
	// New file
	function NewFile () {
		Debug.Log ( "Created new file" );
	};

	// Open file
	function OpenFile () {
		OGRoot.GoToPage ( "OpenFile" );
	}
		
	// Save file
	function SaveFile () {
		if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
			SaveAs ();
			return;
		}
	
		EditorCore.SaveFile ( EditorCore.currentLevel.name );
	}
	
	// Rename level
	function SaveAs () {
		OGRoot.GoToPage ( "SaveAs" );
	}
	
	// Exit editor
	function ExitEditor () {
		Application.LoadLevel ( "main_menu" );
	}
	
	
	////////////////////
	// View menu
	////////////////////
	// Toggle isometric view
	function ToggleIsometric () {
		EditorCore.ToggleIsometric ();
	}
	
	// Toggle wireframe view
	function ToggleWireframe () {
		EditorCore.ToggleWireframe ();
	}
	
	// Toggle wireframe view
	function ToggleTextured () {
		EditorCore.ToggleTextured ();
	}
	
	// Set grid
	function AdjustGrid () {
		OGRoot.GoToPage ( "Grid" );
	}
	
	// Toggle gizmos
	function ToggleGizmos () {
		EditorCore.ToggleGizmos ();
	}
	
	////////////////////
	// Add menu
	////////////////////
	// Prefabs
	function AddPrefab () {
		EditorBrowser.initMode = "Add";
		EditorBrowser.rootFolder = "Prefabs";
		
		OGRoot.GoToPage ( "Browser" );
	}
	
	function AddActor () {
		EditorBrowser.initMode = "Add";
		EditorBrowser.rootFolder = "Actors";
		
		OGRoot.GoToPage ( "Browser" );
	}
	
	function AddItem () {
		EditorBrowser.initMode = "Add";
		EditorBrowser.rootFolder = "Items";
		
		OGRoot.GoToPage ( "Browser" );
	}
	
	function AddLight () {
		EditorCore.AddLight ();
	}
	
	function AddSurface () {
		EditorCore.CreateSurface ();
	}
	
	function AddSpawnPoint () {
		EditorCore.AddSpawnPoint ();
	}
	
	function AddTrigger () {
		EditorCore.AddTrigger ();
	}
	
	////////////////////
	// Edit menu
	////////////////////
	// Undo action
	function UndoAction () {
		EditorCore.UndoCurrentAction ();
	}
		
	
	////////////////////
	// Editors menu
	////////////////////
	// Conversation editor
	function ConversationEditor () {
		OGRoot.GoToPage ( "Conversations" );
	}
	
	// Quest editor
	function QuestEditor () {
		OGRoot.GoToPage ( "Quests" );
	}
	
	// Flag editor
	function FlagEditor () {
		OGRoot.GoToPage ( "Flags" );
	}
	
	
	////////////////////
	// Help menu
	////////////////////
	function ShowHelp () {
		OGRoot.GoToPage ( "Help" );
	}
							
		
	////////////////////
	// Inspector
	////////////////////
	// Adjust position
	function AdjustPosition () {
		EditorAdjust.adjust = "position";
		OGRoot.GoToPage ( "Adjust" );
	}
	
	// Adjust rotation
	function AdjustRotation () {
		EditorAdjust.adjust = "rotation";
		OGRoot.GoToPage ( "Adjust" );
	}
	
	// Adjust scale
	function AdjustScale () {
		EditorAdjust.adjust = "scale";
		OGRoot.GoToPage ( "Adjust" );
	}
	
	// Clear the menus
	function ClearMenus () {		
		tabs.tabs.Clear ();
		
		for ( var c : GameObject in inspectorMenus ) {		
			c.SetActive ( false );
		}
	}
	
	// Display the object's relevant menus
	function AddMenu ( menu : String, selectedObj : GameObject ) {
		var menuObj : GameObject;
		
		for ( var c : GameObject in inspectorMenus ) {		
			if ( c.name == menu ) {
				menuObj = c;
				continue;
			}
		}
		
		if ( !menuObj ) {
			return;
		}
		
		tabs.AddTab ( menu, menuObj );
		
		if ( menu == "Light" ) {
			menuObj.GetComponent(EditorInspectorLight).Init(selectedObj);
		} else if ( menu == "Actor" ) {
			menuObj.GetComponent(EditorInspectorActor).Init(selectedObj);
		} else if ( menu == "Path" ) {
			menuObj.GetComponent(EditorInspectorPath).Init(selectedObj);
		} else if ( menu == "Trigger" ) {
			menuObj.GetComponent(EditorInspectorTrigger).Init(selectedObj);
		} else if ( menu == "Tween" ) {
		//	menuObj.GetComponent(EditorInspectorTween).Init(selectedObj);
		} else if ( menu == "Surface" ) {
			menuObj.GetComponent(EditorInspectorSurface).Init(selectedObj);
		}
	}
	
			
	////////////////////
	// Play level
	////////////////////
	function PlayLevel () {		
		if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
			SaveAs ();
			return;
		}
	
		EditorCore.SaveFile ( EditorCore.currentLevel.name );
		
		EditorCore.PlayLevel ();
	}
	
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		EditorCore.SetInspector ( this );
	}
	
		
	////////////////////
	// Update
	////////////////////	
	override function UpdatePage () {
		if ( EditorCore.currentLevel ) {
			levelName.text = EditorCore.currentLevel.name;
			
			if ( EditorCore.GetSelectedObject() ) {
				if ( !inspector.activeSelf ) {
					inspector.SetActive ( true );
				}
				
				pos.x.transform.parent.gameObject.SetActive ( true );
				rot.x.transform.parent.gameObject.SetActive ( true );
				scl.x.transform.parent.gameObject.SetActive ( true );
				
				var t = EditorCore.GetSelectedObject().transform;
				
				pos.x.text = "X: " + t.localPosition.x.ToString("f2");
				pos.y.text = "Y: " + t.localPosition.y.ToString("f2");
				pos.z.text = "Z: " + t.localPosition.z.ToString("f2");
				
				rot.x.text = "X: " + t.localEulerAngles.x.ToString("f2");
				rot.y.text = "Y: " + t.localEulerAngles.y.ToString("f2");
				rot.z.text = "Z: " + t.localEulerAngles.z.ToString("f2");
				
				scl.x.text = "X: " + t.localScale.x.ToString("f2");
				scl.y.text = "Y: " + t.localScale.y.ToString("f2");
				scl.z.text = "Z: " + t.localScale.z.ToString("f2");
							
			} else if ( inspector.activeSelf ) {
				inspector.SetActive ( false );

			}
		}
	}
}