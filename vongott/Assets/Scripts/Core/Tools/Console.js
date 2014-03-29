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
				case "music":
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
							output = "No soundtrack for the state '" + args[1] + "'";
							break;
					}
					break;

				default:
					output = "ERROR: set: Invalid argument '" + args[0] + "'";
					break;			
							
			}
		} else {
			output = "ERROR: set: Not enough arguments provided. Input was '" + input + "'";

		}

		return output;
	}

	public function Parse ( input : String ) : String {
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
