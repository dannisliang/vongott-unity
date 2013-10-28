#pragma strict

class Shape extends MonoBehaviour {
	// Init
	function OnDisable () {
		if ( EditorCore.running && Camera.main && Camera.main.GetComponent(EditorCamera) ) {
			Camera.main.GetComponent(EditorCamera).drawBoxes.Remove ( this.gameObject );
		}
	}
	
	function Start () {
		if ( Camera.main && Camera.main.GetComponent(EditorCamera) && !this.GetComponent(InteractiveObject) ) {
			Camera.main.GetComponent(EditorCamera).drawBoxes.Add ( this.gameObject );
			this.GetComponent(MeshRenderer).enabled = false;
		}
	}
}