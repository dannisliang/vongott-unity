#pragma strict

class EditorInspectorPrefab extends MonoBehaviour {
	//////////////////
	// Prerequisites
	//////////////////
	// Public vars
	var generic : GameObject;
	var wall : GameObject;
	
	// Private vars
	@HideInInspector private var currentWalls : List.< Prefab > = new List.< Prefab > ();
	
	//////////////////
	// Wall
	//////////////////
	// Pick next
	function PickNextWall ( wall : String ) {
	
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
}