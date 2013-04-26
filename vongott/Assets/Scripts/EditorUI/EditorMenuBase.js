#pragma strict

private class VectorDisplay {
	var x : OGLabel;
	var y : OGLabel;
	var z : OGLabel;
}

class EditorMenuBase extends OGPage {	
	////////////////////
	// Inspector
	////////////////////
	var objectName : OGLabel;
	
	var pos : VectorDisplay;
	var rot : VectorDisplay;
	var scl : VectorDisplay;
	
	
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
	// Update
	////////////////////
	function Update () {
		if ( EditorCore.currentLevel ) {
			var count = EditorCore.GetSelectedObjects().Count;
			
			if ( count > 0 && EditorCore.GetSelectedObjects()[count-1] ) {
				pos.x.transform.parent.gameObject.SetActive ( true );
				rot.x.transform.parent.gameObject.SetActive ( true );
				scl.x.transform.parent.gameObject.SetActive ( true );
				
				var t = EditorCore.GetSelectedObjects()[count-1].transform;
				
				pos.x.text = t.localPosition.x.ToString("f1");
				pos.y.text = t.localPosition.y.ToString("f1");
				pos.z.text = t.localPosition.z.ToString("f1");
				
				rot.x.text = t.localEulerAngles.x.ToString("f1");
				rot.y.text = t.localEulerAngles.y.ToString("f1");
				rot.z.text = t.localEulerAngles.z.ToString("f1");
				
				scl.x.text = t.localScale.x.ToString("f1");
				scl.y.text = t.localScale.y.ToString("f1");
				scl.z.text = t.localScale.z.ToString("f1");
				
				objectName.text = t.gameObject.name;
			
			} else {
				pos.x.transform.parent.gameObject.SetActive ( false );
				rot.x.transform.parent.gameObject.SetActive ( false );
				scl.x.transform.parent.gameObject.SetActive ( false );
				
				objectName.text = EditorCore.currentLevel.name;
			}
		}
	}
}