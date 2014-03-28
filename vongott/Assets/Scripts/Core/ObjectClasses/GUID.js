﻿#pragma strict

class GUID extends MonoBehaviour {
	public var GUID : String = "";

	public function NewGUID () {
		GUID = System.Guid.NewGuid().ToString();
	}	
	
	function Start () {
		// Generate GUID if necessary
		if ( GUID == "" ) {
			NewGUID ();
		}
	}
}
