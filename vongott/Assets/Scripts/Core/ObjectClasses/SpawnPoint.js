#pragma strict

class SpawnPoint extends MonoBehaviour {
	function Start () {
		// Generate GUID if necessary
		if ( this.gameObject.name.Length < 30 ) {
			this.gameObject.name = System.Guid.NewGuid().ToString();
		}
	}
}