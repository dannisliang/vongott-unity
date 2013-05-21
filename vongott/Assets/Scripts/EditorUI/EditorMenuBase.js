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
	@HideInInspector var subMenus : GameObject[] = new GameObject[3];
	
	
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
			RenameLevel ();
			return;
		}
	
		EditorCore.SaveFile ( EditorCore.currentLevel.name );
	}
	
	// Rename level
	function RenameLevel () {
		OGRoot.GoToPage ( "RenameLevel" );
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
		EditorCore.ToggleIsometric();
	}
	
	// Toggle wireframe view
	function ToggleWireframe () {
		EditorCore.ToggleWireframe();
	}
	
	// Toggle wireframe view
	function ToggleTextured () {
		EditorCore.ToggleTextured();
	}
	
	// Set grid
	function AdjustGrid () {
		EditorAdjust.adjust = "grid";
		OGRoot.GoToPage ( "Adjust" );
	}
	
	////////////////////
	// Add menu
	////////////////////
	// Prefabs
	function AddPrefab () {
		OGRoot.GoToPage ( "Prefabs" );
	}
	
	function AddActor () {
		OGRoot.GoToPage ( "Actors" );
	}
	
	function AddItem () {
		OGRoot.GoToPage ( "Items" );
	}
	
	function AddLight () {
		EditorCore.AddLight ();
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
		for ( var t = 0; t < tabs.tabs.Count; t++ ) {
			tabs.tabs[t].label = "";
		}
		
		for ( var i = 0; i < subMenus.Length; i++ ) {
			if ( subMenus[i] ) {
				subMenus[i].SetActive ( false );
				subMenus[i] = null;
			}
		}
	}
	
	// Display the object's relevant menus
	function SetMenu ( index : int, menu : String, selectedObj : GameObject ) {
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
		
		if ( subMenus[index] ) {
			subMenus[index].SetActive ( false );
			subMenus[index] = null;
		}
		
		subMenus[index] = menuObj;
		subMenus[index].SetActive ( false );
		
		if ( menu == "Light" ) {
			subMenus[index].GetComponent(EditorInspectorLight).Init(selectedObj);
		} else if ( menu == "Actor" ) {
			subMenus[index].GetComponent(EditorInspectorActor).Init(selectedObj);
		/*} else if ( menu == "Path" ) {
			subMenus[index].GetComponent(EditorInspectorPath).Init(selectedObj);
		} else if ( menu == "Trigger" ) {
			subMenus[index].GetComponent(EditorInspectorTrigger).Init(selectedObj);
		*/} else if ( menu == "Tween" ) {
			subMenus[index].GetComponent(EditorInspectorTween).Init(selectedObj);
		}
		
		tabs.tabs[index].label = menu;
	}
	
	// Activate a menu
	function SelectSubmenu ( num : String ) {
		var number = int.Parse ( num );
		
		for ( var i = 0; i < subMenus.Length; i++ ) {
			if ( subMenus[i] ) {
				subMenus[i].SetActive ( number == i );
			}
		}
		
		tabs.activeTab = number;
	}
	
			
	////////////////////
	// Play level
	////////////////////
	function PlayLevel () {		
		if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
			RenameLevel ();
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
		
		ClearMenus ();
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
				
				pos.x.text = "X: " + t.localPosition.x.ToString("f1");
				pos.y.text = "Y: " + t.localPosition.y.ToString("f1");
				pos.z.text = "Z: " + t.localPosition.z.ToString("f1");
				
				rot.x.text = "X: " + t.localEulerAngles.x.ToString("f1");
				rot.y.text = "Y: " + t.localEulerAngles.y.ToString("f1");
				rot.z.text = "Z: " + t.localEulerAngles.z.ToString("f1");
				
				scl.x.text = "X: " + t.localScale.x.ToString("f1");
				scl.y.text = "Y: " + t.localScale.y.ToString("f1");
				scl.z.text = "Z: " + t.localScale.z.ToString("f1");
				
				objectName.text = t.gameObject.name;
			
			} else if ( inspector.activeSelf ) {
				inspector.SetActive ( false );
			}
		}
	}
}