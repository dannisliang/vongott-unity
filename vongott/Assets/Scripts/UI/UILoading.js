#pragma strict

class UILoading extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	
	// Static vars
	static var loadScene : String;
	var timer : float = 1.0;
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( timer <= 0.0 ) {
			if ( loadScene ) {
				Application.LoadLevel ( loadScene );
			}
		} else {
			timer -= Time.deltaTime;
		}
	}
}