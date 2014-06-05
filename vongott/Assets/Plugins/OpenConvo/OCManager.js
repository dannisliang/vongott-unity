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
	public var eventHandler : GameObject;
	public var speakers : OCSpeaker [] = new OCSpeaker [0];

	private var speaker : OCSpeaker;

	public static var instance : OCManager;

	public static function GetInstance () : OCManager {
		return instance;
	}

	private function DoCallback ( target : GameObject, message : String, object : Object ) {	
		if ( target ) {
			target.SendMessage ( message, object, SendMessageOptions.DontRequireReceiver );
		}
	}
	
	private function DoCallback ( target : GameObject, message : String, argument : String ) {
		if ( target ) {
			target.SendMessage ( message, argument, SendMessageOptions.DontRequireReceiver );
		}
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
		tree = null;
		
		DoCallback ( eventHandler, "OnConversationEnd", speaker );
	}

	public function DisplayNode () {
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
						DoCallback ( node.event.object, node.event.message, node.event.argument );

					} else {
						DoCallback ( node.event.object, node.event.message, tree );
					
					}

				} else {
					if ( !String.IsNullOrEmpty ( node.event.argument ) ) {
						DoCallback ( eventHandler, node.event.message, node.event.argument );

					} else if ( node.event.object != null ) {
						DoCallback ( eventHandler, node.event.message, node.event.object );

					} else {
						DoCallback ( eventHandler, node.event.message, tree );
					
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
			DoCallback ( eventHandler, "OnSetLines", node.speak.lines );
			DoCallback ( eventHandler, "OnSetSpeaker", speaker );
		
		}
	}

	public function SelectOption ( i : int ) {
		currentNode = tree.rootNodes[tree.currentRoot].GetNode(currentNode).connectedTo[i];
		DisplayNode ();
	}

	public function NextNode () {
		currentNode = tree.rootNodes[tree.currentRoot].GetNode(currentNode).connectedTo[0];
		DisplayNode ();
	}

	public function StartConversation ( tree : OCTree ) {
		if ( !this.tree && tree && tree.rootNodes.Length > 0 ) {
			this.tree = tree;

			currentNode = tree.rootNodes[tree.currentRoot].firstNode;
			
			DoCallback ( eventHandler, "OnConversationStart", tree );

			DisplayNode ();
		}
	}
}
