#pragma strict

private class VectorDisplay {
	public var x : OGLabel;
	public var y : OGLabel;
	public var z : OGLabel;
}

class EditorMenuBase extends OGPage {	
	////////////////////
	// Public vars
	////////////////////
	public var objectGUID : OGLabel;
	public var objectName : OGTextField;
	public var levelName : OGLabel;
	public var editLevelData : OGButton;
	public var menuBackground : OGSlicedSprite;
	
	public var inspector : GameObject;
	public var inspectorMenus : GameObject[];
	
	public var pos : VectorDisplay;
	public var rot : VectorDisplay;
	public var scl : VectorDisplay;
	
	public var tabs : OGTabs;
	
	public var initName : boolean = false;
	
	public var transformDisplay : GameObject;

	////////////////////
	// Data menu
	////////////////////
	public function EditMapData () {
		EditorEditMapData.loadSettings = true;
		OGRoot.GetInstance().GoToPage ( "EditMapData" );
	}

	////////////////////
	// File menu
	////////////////////
	// New file
	function NewFile () {
		Debug.Log ( "Created new file" );
	}

	// Open file
	function OpenFile () {
		EditorOpenFile.baseDir = "Maps";
		EditorOpenFile.fileType = "vgmap";
		OGRoot.GetInstance().GoToPage ( "OpenFile" );
	}
	
	// Import OBJ
	function ImportOBJ () {
		EditorOpenFile.baseDir = "ImportOBJ";
		EditorOpenFile.fileType = "obj";
		OGRoot.GetInstance().GoToPage ( "OpenFile" );
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
		OGRoot.GetInstance().GoToPage ( "SaveAs" );
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
	
	// Toggle textured view
	function ToggleTextured () {
		EditorCore.ToggleTextured ();
	}
	
	// Set grid
	function AdjustGrid () {
		OGRoot.GetInstance().GoToPage ( "Grid" );
	}
	
	// Toggle gizmos
	function ToggleGizmos () {
		EditorCore.ToggleGizmos ();
	}
	
	// Toggle first person
	public function ToggleFirstPersonMode () {
		EditorCore.GetInstance().ToggleFirstPersonMode();
	}


	// Toggle navigation
	function ToggleNavigation () {
		EditorCore.ToggleNavigation ();
	}
	
	
	////////////////////
	// Add menu
	////////////////////
	function AddLight () {
		EditorCore.AddLight ();
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
		OGRoot.GetInstance().GoToPage ( "ConversationMap" );
	}
	
	// Quest editor
	function QuestEditor () {
		OGRoot.GetInstance().GoToPage ( "Quests" );
	}
	
	// Event editor
	function EventEditor () {
		OGRoot.GetInstance().GoToPage ( "Events" );
	}
	
	// Flag editor
	function FlagEditor () {
		OGRoot.GetInstance().GoToPage ( "Flags" );
	}
	
	
	////////////////////
	// Navigation
	////////////////////
	function AddNavGrid () {
		EditorConfirmDialog.message = "This will delete all previous navigation data. Continue?";
		EditorConfirmDialog.sender  = "MenuBase";
		EditorConfirmDialog.yesAction = function () {
		
		};
		
		OGRoot.GetInstance().GoToPage ( "ConfirmDialog" );
	}
	
	function AddNavNode () {	
		EditorCore.AddWayPoint ();
	}
	
	function AddNavMesh () {
		EditorConfirmDialog.message = "This will delete all previous navigation data. Continue?";
		EditorConfirmDialog.sender  = "MenuBase";
		EditorConfirmDialog.yesAction = function () {
			EditorCore.AddNavMesh ();
		};
		
		OGRoot.GetInstance().GoToPage ( "ConfirmDialog" );
	}
	
	function BakeNodes () {
		EditorConfirmDialog.message = "Generating the navigation nodes might take a minute. Continue?";
		EditorConfirmDialog.sender  = "MenuBase";
		EditorConfirmDialog.yesAction = function () {
			EditorCore.GetInstance().BakeNavNodes ();
		};
		
		OGRoot.GetInstance().GoToPage ( "ConfirmDialog" );
	}
	
	public function SetToWayPoint () {
		EditorCore.GetInstance().GetComponent(OPScanner).mapType = OPMapType.WayPoint;
	}
	
	public function SetToGrid () {
		EditorCore.GetInstance().GetComponent(OPScanner).mapType = OPMapType.Grid;
	}
	
	public function SetToNavMesh () {
		EditorCore.GetInstance().GetComponent(OPScanner).mapType = OPMapType.NavMesh;
	}
	
	
	////////////////////
	// Help menu
	////////////////////
	function ShowHelp () {
		OGRoot.GetInstance().GoToPage ( "Help" );
	}
							
		
	////////////////////
	// Inspector
	////////////////////
	// Renew GUID
	function RenewGUID () {
		if ( EditorCore.GetSelectedObject().GetComponent(GUID) ) {
			EditorCore.GetSelectedObject().GetComponent(GUID).NewGUID();
		}
	}
	
	// Adjust position
	function AdjustPosition () {
		EditorAdjust.adjust = "position";
		OGRoot.GetInstance().GoToPage ( "Adjust" );
	}
	
	// Adjust rotation
	function AdjustRotation () {
		EditorAdjust.adjust = "rotation";
		OGRoot.GetInstance().GoToPage ( "Adjust" );
	}
	
	// Adjust scale
	function AdjustScale () {
		EditorAdjust.adjust = "scale";
		OGRoot.GetInstance().GoToPage ( "Adjust" );
	}
	
	// Clear the menus
	function ClearMenus () {		
		tabs.ClearTabs ();
		
		for ( var c : GameObject in inspectorMenus ) {		
			c.SetActive ( false );
		}
	}
	
	// Display the object's relevant menus
	private function DisplayMenu ( menu : String, menuObj : GameObject, selectedObj : GameObject ) : IEnumerator {
		yield WaitForEndOfFrame();

		switch ( menu ) {
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
		
		StartCoroutine ( DisplayMenu ( menu, menuObj, selectedObj ) );
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
			if ( EditorCore.currentLevelData ) {
				levelName.text = EditorCore.currentLevelData.name;
			} else {
				EditorCore.currentLevelData = new MapData ();
			}

			if ( EditorCore.GetSelectedObject() ) {
				if ( !inspector.activeSelf ) {
					inspector.SetActive ( true );
					pos.x.transform.parent.gameObject.SetActive ( true );
					rot.x.transform.parent.gameObject.SetActive ( true );
					scl.x.transform.parent.gameObject.SetActive ( true );
				
					menuBackground.stretch.widthOffset = -340;
					levelName.anchor.xOffset = -390;
					editLevelData.anchor.xOffset = -340;
				}
				
				if ( EditorCore.GetSelectedObject().GetComponent(GUID) ) {
					objectGUID.text = EditorCore.GetSelectedObject().GetComponent(GUID).GUID;
				} else {
					objectGUID.text = "N/A";
				}

				if ( objectName.listening ) {
					EditorCore.GetSelectedObject().name = objectName.text;
				} else {
					objectName.text = EditorCore.GetSelectedObject().name;
				}

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
							
			} else if ( inspector.activeSelf && EditorCore.running ) {
				inspector.SetActive ( false );
				menuBackground.stretch.widthOffset = -20;
				levelName.anchor.xOffset = -70;
				editLevelData.anchor.xOffset = -20;

			}
		}
	}
}
