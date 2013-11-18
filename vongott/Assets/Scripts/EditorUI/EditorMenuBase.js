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
	var objectName : OGLabel;
	var levelName : OGLabel;
	
	var inspector : GameObject;
	var inspectorMenus : GameObject[];
	
	var pos : VectorDisplay;
	var rot : VectorDisplay;
	var scl : VectorDisplay;
	
	var tabs : OGTabs;
	
	var initName : boolean = false;
	
	var transformDisplay : GameObject;
	
	
	////////////////////
	// File menu
	////////////////////
	// New file
	function NewFile () {
		Debug.Log ( "Created new file" );
	};

	// Open file
	function OpenFile () {
		EditorOpenFile.baseDir = "Maps";
		EditorOpenFile.fileType = "vgmap";
		OGRoot.GoToPage ( "OpenFile" );
	}
	
	// Import OBJ
	function ImportOBJ () {
		EditorOpenFile.baseDir = "ImportOBJ";
		EditorOpenFile.fileType = "obj";
		OGRoot.GoToPage ( "OpenFile" );
	}
		
	// Save file
	function SaveFile () {
		if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
			SaveAs ();
			return;
		}
	
		EditorCore.GetInstance().SaveFile ( EditorCore.currentLevel.name );
	}
	
	// Rename level
	function SaveAs () {
		OGRoot.GoToPage ( "SaveAs" );
	}
	
	// Exit editor
	function ExitEditor () {
		EditorCore.Stop ();
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
	
	// Toggle navigation
	function ToggleNavigation () {
		EditorCore.ToggleNavigation ();
	}
	
	
	////////////////////
	// Add menu
	////////////////////
	// Prefabs
	function AddPrefab () {
		EditorBrowserWindow.initMode = "Add";
		EditorBrowserWindow.rootFolder = "Prefabs";
		
		OGRoot.GoToPage ( "BrowserWindow" );
	}
	
	function AddActor () {
		EditorBrowserWindow.initMode = "Add";
		EditorBrowserWindow.rootFolder = "Actors";
		
		OGRoot.GoToPage ( "BrowserWindow" );
	}
	
	function AddItem () {
		EditorBrowserWindow.initMode = "Add";
		EditorBrowserWindow.rootFolder = "Items";
		
		OGRoot.GoToPage ( "BrowserWindow" );
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
		OGRoot.GoToPage ( "ConversationMap" );
	}
	
	// Quest editor
	function QuestEditor () {
		OGRoot.GoToPage ( "Quests" );
	}
	
	// Event editor
	function EventEditor () {
		OGRoot.GoToPage ( "Events" );
	}
	
	// Flag editor
	function FlagEditor () {
		OGRoot.GoToPage ( "Flags" );
	}
	
	
	////////////////////
	// Navigation
	////////////////////
	function AddNavGrid () {
		EditorConfirmDialog.message = "This will delete all previous navigation data. Continue?";
		EditorConfirmDialog.sender  = "MenuBase";
		EditorConfirmDialog.yesAction = function () {
		
		};
		
		OGRoot.GoToPage ( "ConfirmDialog" );
	}
	
	function AddNavNode () {	
		EditorCore.AddNavNode ();
	}
	
	function AddNavMesh () {
		EditorConfirmDialog.message = "This will delete all previous navigation data. Continue?";
		EditorConfirmDialog.sender  = "MenuBase";
		EditorConfirmDialog.yesAction = function () {
			EditorCore.AddNavMesh ();
		};
		
		OGRoot.GoToPage ( "ConfirmDialog" );
	}
	
	function BakeNodes () {
		EditorConfirmDialog.message = "Generating the navigation nodes might take a minute. Continue?";
		EditorConfirmDialog.sender  = "MenuBase";
		EditorConfirmDialog.yesAction = function () {
			EditorCore.GetInstance().BakeNavNodes ();
		};
		
		OGRoot.GoToPage ( "ConfirmDialog" );
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
	// Renew GUID
	function RenewGUID () {
		EditorCore.GetSelectedObject().GetComponent(GUID).NewGUID();
	}
	
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
	private function DisplayMenu ( menu : String, menuObj : GameObject, selectedObj : GameObject ) {
		
		switch ( menu ) {
			case "Shape":
				menuObj.GetComponent(EditorInspectorShape).Init(selectedObj);
				break;
			
			case "CombinedMesh":
				menuObj.GetComponent(EditorInspectorCombinedMesh).Init(selectedObj);
				break;
				
			case "ImportedMesh":
				menuObj.GetComponent(EditorInspectorImportedMesh).Init(selectedObj);
				break;
			
			case "Light":
				menuObj.GetComponent(EditorInspectorLight).Init(selectedObj);
				break;
			
			case "Actor":
				menuObj.GetComponent(EditorInspectorActor).Init(selectedObj);
				break;
		
			case "Path":
				menuObj.GetComponent(EditorInspectorPath).Init(selectedObj);
				break;
		
			case "Trigger":
				menuObj.GetComponent(EditorInspectorTrigger).Init(selectedObj);
				break;
		
			case "Surface":
				menuObj.GetComponent(EditorInspectorSurface).Init(selectedObj);
				break;
		
			case "Prefab":
				menuObj.GetComponent(EditorInspectorPrefab).Init(selectedObj);
				break;
		
			case "Computer":
				menuObj.GetComponent(EditorInspectorComputer).Init(selectedObj);
				break;
			
			case "Keypad":
				menuObj.GetComponent(EditorInspectorKeypad).Init(selectedObj);
				break;
				
			case "SurveillanceCamera":
				menuObj.GetComponent(EditorInspectorSurveillanceCamera).Init(selectedObj);
				break;
				
			case "SpawnPoint":
				menuObj.GetComponent(EditorInspectorSpawnPoint).Init(selectedObj);
				break;
					
			case "Terminal":
				menuObj.GetComponent(EditorInspectorTerminal).Init(selectedObj);
				break;
				
			case "Wallet":
				menuObj.GetComponent(EditorInspectorWallet).Init(selectedObj);
				break;
				
			case "LiftPanel":
				menuObj.GetComponent(EditorInspectorLiftPanel).Init(selectedObj);
				break;
		}
	}
		
	function AddMenu ( menu : String, selectedObj : GameObject ) {
		AddMenu ( menu, selectedObj, false );
	}
	
	function AddMenu ( menu : String, selectedObj : GameObject, hasPriority : boolean ) {
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
		
		tabs.AddTab ( menu, menuObj, hasPriority );	
		
		DisplayMenu ( menu, menuObj, selectedObj );
	}
	
			
	////////////////////
	// Play level
	////////////////////
	function PlayLevel () {		
		if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
			SaveAs ();
			return;
		}
	
		EditorCore.GetInstance().SaveFile ( EditorCore.currentLevel.name );
		
		EditorCore.PlayLevel ();
	}
	
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		EditorCore.SetInspector ( this );
	
		Camera.main.GetComponent(EditorCamera).locked = false;
	}
	
	override function ExitPage () {
		Camera.main.GetComponent(EditorCamera).locked = true;
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
				
				if ( EditorCore.GetSelectedObject().GetComponent(GUID) ) {
					objectName.text = EditorCore.GetSelectedObject().GetComponent(GUID).GUID;
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