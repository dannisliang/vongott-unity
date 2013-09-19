#pragma strict

class GUID extends MonoBehaviour {
	var GUID : String = "";
	
	function Start () {
		// Generate GUID if necessary
		if ( GUID == "" ) {
			GUID = System.Guid.NewGuid().ToString();
		}
	}
}