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
	}
	
	static function Activate ( mod : String ) {
		if ( activeMod != "" ) {
			DeactivateMod ( activeMod );
		} else if ( mod == activeMod ) {
			DeactivateMod ( mod );
			return;
		}
		
		switch ( mod ) {
			case "Reflexes":
				GameCore.GetInstance().TweenTimeScale ( 1, 0.1, 1.0 );
					
				break;
		}
	}
}