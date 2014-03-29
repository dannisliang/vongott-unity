#pragma strict

public class Console extends MonoBehaviour {

	function Start () {

	}

	function Update () {

	}

	private function Set ( input : String ) : String {
		var args : String [] = input.Split ( " "[0] );
		var output : String = "";

		if ( args.Length > 1 ) {
			switch ( args[0] ) {
				case "soundtrack":
					switch ( args[1] ) {
						case "aggressive":
							MusicManager.GetInstance().PlayAggressive();
							output =  "Playing aggressive soundtrack";
							break;

						case "calm":
							MusicManager.GetInstance().PlayCalm();
							output = "Playing calm soundtrack";
							break;

						default:
							output = "[ERROR] No soundtrack for the state '" + args[1] + "'";
							break;
					}
					break;

				case "player":
					switch ( args[1] ) {
						case "immortal":
							// TODO: god mode on
							output =  "Player is immortal";
							break;

						case "mortal":
							// TODO: god mode off
							output = "Player is mortal";
							break;

						default:
							output = "[ERROR] No player state '" + args[1] + "'";
							break;
					}
					
					break;

				default:
					output = "[ERROR] set: Invalid argument '" + args[0] + "'";
					break;			
							
			}
		} else {
			output = "[ERROR] set: Not enough arguments provided. Input was '" + input + "'";

		}

		return output;
	}

	private function Give ( input : String ) : String {
		var args : String [] = input.Split ( " "[0] );
		var output : String = "";

		if ( args.Length > 1 ) {
			switch ( args[0] ) {
				case "weapon":
					switch ( args[1] ) {
						case "all":
							// TODO: give all weapons
							output =  "Got all weapons";
							break;

						default:
							output = "[ERROR] No weapon by the name '" + args[1] + "'";
							break;
					}
					break;

				default:
					output = "[ERROR] give: Invalid argument '" + args[0] + "'";
					break;			
							
			}
		} else {
			output = "[ERROR] give: Not enough arguments provided. Input was '" + input + "'";

		}
		

		return output;
	}

	public function Parse ( input : String ) : String {
		// Shorcuts
		if ( input == "god" ) {
			// TODO: check for toggle
			return Set ( "player immortal" );	
		} else if ( input == "allweapons" ) {
			return Give ( "weapon all" );
		}
		
		var strings : String [] = input.Split ( " "[0], 2 );
		var output : String = "";

		var args : String = "";

		for ( var i : int = 1; i < strings.Length; i++ ) {
			args += strings[i] + " ";
		}

		if ( strings.Length > 1 ) {
			switch ( strings[0] ) {
				// Set
				case "set":
					output = Set ( args );
					break;
			
				// Give
				case "give":
					output = Give ( args );
					break;

				// Unknown
				default:
					output = "ERROR: Invalid function '" + strings[0] + "'";
					break;
			}
		
		} else {
			output = "ERROR: No arguments provided";

		}	

		return output;
	}
}
