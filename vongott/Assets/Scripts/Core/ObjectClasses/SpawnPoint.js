#pragma strict

@script RequireComponent(GUID)

class SpawnPoint extends MonoBehaviour {
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
	}
}