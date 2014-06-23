#pragma strict

public class OCSpeaker {
	public var name : String = "";
	public var gameObject : GameObject;

	function OCSpeaker ( name : String, gameObject : GameObject ) {
		this.name = name;
		this.gameObject = gameObject;
	}
}
	
public class OCManager extends MonoBehaviour {
	public var flags : OCFlags = new OCFlags ();
	public var tree : OCTree;
	public var currentNode : int;
	public var eventHandler : OCEventHandler;
	public var speakers : OCSpeaker [] = new OCSpeaker [0];

	private var currentAudioSource : AudioSource;
	private var speaker : OCSpeaker;

	public static var instance : OCManager;

	public static function GetInstance () : OCManager {
		return instance;
	}

	public function get optionCount () : int {
		var node : OCNode = tree.rootNodes[tree.currentRoot].GetNode ( currentNode );
		
		if ( node && node.speak && node.type == OCNodeType.Speak ) {
			return node.speak.lines.Length;
		
		} else {
			return 0;
		
		}
	}

	public function SetSpeakerObjects ( speakerObjects : GameObject [] ) {
		for ( var i : int = 0; i < speakers.Length; i++ ) {
			speakers[i].gameObject = speakerObjects [i];
		}
	}
	
	public function SetSpeakers ( speakerNames : String [], speakerObjects : GameObject [] ) {
		speakers = new OCSpeaker [ speakerNames.Length ];
		
		for ( var i : int = 0; i < speakers.Length; i++ ) {
			speakers[i] = new OCSpeaker ( speakerNames[i], speakerObjects[i] );
		}
	}

	public function Start () {
		instance = this;
	}

	public function EndConversation () {
		EndConversation ( true );
	}

	public function EndConversation ( stopAudio : boolean ) {
		if ( stopAudio && currentAudioSource ) {
			currentAudioSource.Stop ();
		}
		
		tree = null;
		currentAudioSource = null;
		
		if ( eventHandler ) {
			eventHandler.OnConversationEnd ();
		}
	}

	private function PlayLineAudio ( node : OCNode ) : IEnumerator {
		// Make sure no other conversation audio is playing
		if ( currentAudioSource ) {
			currentAudioSource.Stop ();
		}

		// With audio
		// ^ Play
		if ( speaker.gameObject.audio && node.speak.lines[node.speak.index].audio ) {
			speaker.gameObject.audio.clip = node.speak.lines[node.speak.index].audio;
			speaker.gameObject.audio.loop = false;
			speaker.gameObject.audio.Play ();
			currentAudioSource = speaker.gameObject.audio;
			
			// If it's a choice or a single smalltalk node, automatically continue after the audio has finished
			if ( node.speak.lines.Length > 1 || node.speak.smalltalk ) {
				while ( currentAudioSource && currentAudioSource.isPlaying ) {
					yield null;	
				}

				// If we already continued manually, abort
				if ( node.id == currentNode ) {
					yield WaitForSeconds ( 0.5 );
					NextNode ( node.speak.index );
				}
			}
		
		// No audio
		// ^ If it's smalltalk, estimate the amount of time it would take to say the line and then continue
		} if ( node.speak.smalltalk ) {
			yield WaitForSeconds ( node.speak.lines[node.speak.index].text.Length / 10 );
			
			NextNode ();

		// ^ If it's a choice, continue immediately
		} else if ( node.speak.lines.Length > 1 ) {
			NextNode ( node.speak.index );

		}
	}

	public function DisplayNode () : void {
		var node : OCNode = tree.rootNodes[tree.currentRoot].GetNode ( currentNode );
		var wait : boolean = false;
		var exit : boolean = false;
		var nextNode : int;

		switch ( node.type ) {
			case OCNodeType.Jump:
				tree.currentRoot = node.jump.rootNode;
				nextNode = tree.rootNodes[tree.currentRoot].firstNode;
				break;

			case OCNodeType.Speak:
				speaker = speakers [ node.speak.speaker ];
				wait = true;
				break;

			case OCNodeType.Event:
				if ( node.event.object != null && node.event.eventToTarget ) {
					if ( !String.IsNullOrEmpty ( node.event.argument ) ) {
						node.event.object.SendMessage ( node.event.message, node.event.argument, SendMessageOptions.DontRequireReceiver );

					} else {
						node.event.object.SendMessage ( node.event.message, tree, SendMessageOptions.DontRequireReceiver );
					
					}

				} else if ( eventHandler ) {
					if ( !String.IsNullOrEmpty ( node.event.argument ) ) {
						eventHandler.Event ( node.event.message, node.event.argument );

					} else if ( node.event.object != null ) {
						eventHandler.Event ( node.event.message, node.event.object );

					} else {
						eventHandler.Event ( node.event.message, tree );
					
					}

				}

				nextNode = node.connectedTo[0];
				break;

			case OCNodeType.SetFlag:
				flags.Set ( node.setFlag.flag, node.setFlag.b );
			
				nextNode = node.connectedTo[0];
				break;

			case OCNodeType.GetFlag:
				if ( flags.Get ( node.getFlag.flag ) ) {
					nextNode = node.connectedTo[1];

				} else {
					nextNode = node.connectedTo[0];

				}
				break;

			case OCNodeType.End:
				tree.currentRoot = node.end.rootNode;
				exit = true;
				break;
		}

		if ( exit ) {
			EndConversation ();

		} else if ( !wait ) {
			currentNode = nextNode;
			DisplayNode ();
		
		} else if ( node && node.speak ) {
			eventHandler.OnSetSpeaker ( speaker, node.speak );
			
			if ( node.speak.lines.Length == 1 || node.speak.smalltalk ) {
				StartCoroutine ( PlayLineAudio ( node ) );
				
				if ( node.speak.smalltalk ) {
					if ( node.speak.index < node.speak.lines.Length - 1 ) {
						node.speak.index++;
					
					} else {
						node.speak.index = 0;

					}
				}
			}
		}
	}

	public function SelectOption ( i : int ) {
		eventHandler.OnSelectOption ( i );
		
		var node : OCNode = tree.rootNodes[tree.currentRoot].GetNode ( currentNode );
		node.speak.index = i;

		StartCoroutine ( PlayLineAudio ( node ) );
	}

	public function NextNode () {
		NextNode ( 0 );
	}

	public function NextNode ( i : int ) {
		var rootNode : OCRootNode = tree.rootNodes[tree.currentRoot];
		var node : OCNode = rootNode.GetNode ( currentNode );

		if ( i < node.connectedTo.Length ) {
			currentNode = node.connectedTo[i];
			DisplayNode ();
		
		} else {
			Debug.LogError ( "OCManager | Node index '" + i + "' out of range (0-" + ( node.connectedTo.Length - 1 ) + ")" );
			EndConversation ();
				
		}
	}

	public function StartConversation ( tree : OCTree ) {
		if ( !this.tree && tree && tree.rootNodes.Length > 0 ) {
			this.tree = tree;

			currentNode = tree.rootNodes[tree.currentRoot].firstNode;
			
			eventHandler.OnConversationStart ( tree );

			DisplayNode ();
		}
	}
}
