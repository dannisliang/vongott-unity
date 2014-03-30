﻿#pragma strict

public class Console extends MonoBehaviour {
	private var inputString : String = "";

	function Start () {

	}

	function Update () {

	}

	function OnGUI () {
		var labelStyle : GUIStyle = new GUIStyle ();
		labelStyle.alignment = TextAnchor.LowerLeft;
		labelStyle.normal.textColor = Color.white;
		
		GUI.Label ( new Rect ( 10, 10, Screen.width, Screen.height / 2 ), GameCore.debugString, labelStyle );

		if ( Event.current.type == EventType.KeyDown ) {
			if ( Event.current.keyCode == KeyCode.Return ) {
				GameCore.Print ( Parse ( inputString ) );
				inputString = "";
			} else if ( Event.current.keyCode == KeyCode.Escape || Event.current.keyCode == KeyCode.Tab ) {
				UIHUD.GetInstance().ToggleConsole ();
			}
		}
		
		GUI.SetNextControlName ( "ActiveTextField" );
		
		inputString = GUI.TextArea ( new Rect ( 10, Screen.height / 2 + 20, Screen.width - 20, 20 ), inputString, labelStyle );

		inputString = Regex.Replace ( inputString, "[^a-zA-Z0-9-_. ]", "" );
		
		GUI.FocusControl ( "ActiveTextField" );
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
							output = "Player is immortal";
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
			output = "[ERROR] give: Not enough arguments provided.";

		}
		

		return output;
	}

	private function Kill ( input : String ) : String {
		var args : String [] = input.Split ( " "[0] );
		var output : String = "";

		switch ( args[0] ) {
			case "target":
				var ray : Ray = Camera.main.ScreenPointToRay ( new Vector3 ( Camera.main.pixelWidth / 2, Camera.main.pixelHeight / 2, 0 ) );
				var hit : RaycastHit;
				
				if ( Physics.Raycast ( Camera.main.transform.position, ray.direction, hit, Mathf.Infinity ) ) {
					if ( hit.collider.gameObject.GetComponent(Actor) ) {
						hit.collider.gameObject.GetComponent(Actor).Die ();
					
					} else if ( hit.collider.gameObject.GetComponent(DestructibleObject) ) {
						hit.collider.gameObject.GetComponent(DestructibleObject).Explode ( 50, 10 );

					}
				}
				output = "Pew pew!";
				break;

			case "player":
				GameCore.GetPlayer().Die();
				output = "Player committed suicide";
				break;

			default:
				output = "[ERROR] kill: Invalid target '" + input + "'";
				break;
		}

		return output;
	}

	public function Parse ( input : String ) : String {
		var strings : String [] = input.Split ( " "[0], 2 );
		var output : String = "> " + input + "\n";

		var args : String = "";

		for ( var i : int = 1; i < strings.Length; i++ ) {
			args += strings[i] + " ";
		}

		if ( strings.Length > 1 ) {
			switch ( strings[0] ) {
				// Set
				case "set":
					output += Set ( args );
					break;
			
				// Give
				case "give":
					output += Give ( args );
					break;

				case "kill":
					output += Kill ( args );
					break;

				// Unknown
				default:
					output += "[ERROR] Invalid function '" + strings[0] + "'";
					break;
			}
		
		} else {
			// Shorcuts
			switch ( input ) {
				case "god":
					// TODO: check for toggle
					output += Set ( "player immortal" );
					break;
				
				case "allweapons":
					output += Give ( "weapon all" );
					break;
				
				case "tantalus":
					output += Kill ( "target" );
					break;

				case "killpawns":
					output += Kill ( "all" );
					break;
				
				case "suicide":
					output += Kill ( "player" );
					break;

				default:
					output += "[ERROR] Invalid command";
					break;
			}
		}	

		return output;
	}
}
