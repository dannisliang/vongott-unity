#pragma strict

class EditorInspectorPrefab extends MonoBehaviour {
	//////////////////
	// Prerequisites
	//////////////////
	// Public vars
	var generic : GameObject;

	var textField : OGTextField;
	

	//////////////////
	// Text
	//////////////////
	function UpdateText () {
		var obj : GameObject = EditorCore.GetSelectedObject();
		var tm : TextMesh = obj.GetComponentInChildren ( TextMesh );
		
		if ( tm != null ) {
			tm.text = textField.text;
		}
	}
	
	
	//////////////////
	// Generic
	//////////////////
	// Pick prefab
	function PickPrefab ( btn : OGButton ) {
		EditorBrowserWindow.rootFolder = "Prefabs";
		EditorBrowserWindow.initMode = "OK";
		EditorBrowserWindow.button = btn;
		OGRoot.GoToPage ( "BrowserWindow" );
	}
	
	
	//////////////////
	// Init
	//////////////////
	function Init ( obj : GameObject ) {
		if ( obj.GetComponentInChildren ( TextMesh ) ) {
			textField.transform.parent.gameObject.SetActive ( true );
			textField.text = obj.GetComponentInChildren ( TextMesh ).text;
		} else {
			textField.transform.parent.gameObject.SetActive ( false );
		}
	}
	
	
	//////////////////
	// Update
	//////////////////
	function UpdateObject () {
		
	}
}