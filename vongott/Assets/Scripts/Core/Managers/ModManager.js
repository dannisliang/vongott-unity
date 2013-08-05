#pragma strict

class ModManager {
	static var activeMod : String;
	
	static function Init () {
	
	}
	
	static function DeactivateMod ( mod : String ) {
		switch ( mod ) {
			case "Reflexes":
				GameCore.GetInstance().TweenTimeScale ( 0.1, 1.0, 1.0 );
					
				break;
		}
		
		activeMod = "";
	}
	
	static function Activate ( mod : String ) {
		if ( mod == activeMod ) {
			DeactivateMod ( mod );
			return;
		} else if ( activeMod != "" ) {
			DeactivateMod ( activeMod );
		}
		
		activeMod = mod;
		
		switch ( mod ) {
			case "Reflexes":
				GameCore.GetInstance().TweenTimeScale ( 1, 0.1, 1.0 );
					
				break;
		}
	}
}