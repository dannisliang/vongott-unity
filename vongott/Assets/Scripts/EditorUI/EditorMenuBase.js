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
	var inspectorMenus : GameObject;
	
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
		Debug.Log ( "Exited editor" );
	}
	
	
	////////////////////
	// View menu
	////////////////////
	// Toggle isometric view
	function ToggleIsometric () 
	{
		EditorCore.ToggleIsometric();
	}
	
	// Toggle wireframe view
	function ToggleWireframe () 
	{
		EditorCore.ToggleWireframe();
	}
	
	// Toggle wireframe view
	function ToggleTextured () 
	{
		EditorCore.ToggleTextured();
	}
	
	
	////////////////////
	// Add menu
	////////////////////
	// Prefabs
	function AddPrefab () 
	{
		OGRoot.GoToPage ( "Prefabs" );
	}
	
	function AddCharacter () 
	{
		OGRoot.GoToPage ( "Characters" );
	}
	
	function AddLight () 
	{
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
	
	function SetMenu ( index : int, menu : String ) {
		var obj : GameObject;
		
		for ( var i = 0; i < inspectorMenus.transform.childCount; i++ ) {		
			if ( inspectorMenus.transform.GetChild ( i ).gameObject.name == menu ) {
				obj = inspectorMenus.transform.GetChild ( i ).gameObject;
				continue;
			}
		}
		
		if ( !obj ) {
			return;
		}
		
		if ( subMenus[index] ) {
			subMenus[index].SetActive ( false );
			subMenus[index] = null;
		}
		
		subMenus[index] = obj;
		subMenus[index].SetActive ( false );
		
		tabs.tabs[index].label = menu;
	}
	
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
		EditorCore.PlayLevel ();
		OGRoot.GoToPage ( "PlayMode" );
	}
	
	
	////////////////////
	// Init
	////////////////////
	function Start () {
		EditorCore.SetInspector ( this );
		
		ClearMenus ();
		SetMenu ( 0, "Actor" );
		SetMenu ( 1, "Path" );
		SetMenu ( 2, "Trigger" );
		SelectSubmenu ( "0" );
	}
	
		
	////////////////////
	// Update
	////////////////////
	function Update () {
		if ( EditorCore.currentLevel ) {
			levelName.text = EditorCore.currentLevel.name;
			
			var count = EditorCore.GetSelectedObjects().Count;
			
			if ( count > 0 && EditorCore.GetSelectedObjects()[count-1] ) {
				if ( !inspector.activeSelf ) {
					inspector.SetActive ( true );
				}
				
				pos.x.transform.parent.gameObject.SetActive ( true );
				rot.x.transform.parent.gameObject.SetActive ( true );
				scl.x.transform.parent.gameObject.SetActive ( true );
				
				var t = EditorCore.GetSelectedObjects()[count-1].transform;
				
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
				//inspector.SetActive ( false );
			}
		}
	}
}