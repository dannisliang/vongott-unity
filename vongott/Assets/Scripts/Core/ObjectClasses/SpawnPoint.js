#pragma strict

@script RequireComponent(GUID)

class SpawnPoint extends MonoBehaviour {
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
	
		if ( !EditorCore.running ) {
			this.GetComponent(MeshRenderer).enabled = false;
			this.GetComponent(BoxCollider).enabled = false;
		}
	}
}