#pragma strict

public class OCNodeInspector extends OEComponentInspector {
	private var node : OCNode;
	private var tree : OCTree;
	
	public function Refresh ( tree : OCTree, node : OCNode, transform : Transform ) {
		this.tree = tree;
		this.node = node;
		this.transform = transform;
	}

	override function get type () : System.Type { return typeof ( OCNode ); }

	override function Inspector () {
		if ( !node ) { return; }

		width = 284;
		
		var newType : int = Popup ( "", node.type, System.Enum.GetNames ( OCNodeType ), new Rect ( width / 4, 0, width / 2, 16 ) );

		offset.y += 30;

		if ( newType != node.type ) {
			node.SetType ( newType );
			OCTreeEditor.Refresh ();
		}

		var rootNodeStrings : String [] = new String [ tree.rootNodes.Length ];

		for ( var i : int = 0; i < rootNodeStrings.Length; i++ ) {
			rootNodeStrings[i] = i.ToString ();
		}

		switch ( node.type ) {
			case OCNodeType.Speak:
				var newSpeaker : int = Popup ( "Speaker", node.speak.speaker, tree.GetSpeakerStrings () );

				if ( newSpeaker != node.speak.speaker ) {
					node.speak.speaker = newSpeaker;
					OCTreeEditor.Refresh ();
				}

				offset.y += 20;

				for ( i = 0; i < node.speak.lines.Length; i++ ) {
					LabelField ( i.ToString () ); 
					node.speak.lines[i] = TextField ( "", node.speak.lines[i], new Rect ( 40, offset.y, width - 40, 60 ) );
					offset.y += 50;
				}

				offset.y += 20;

				if ( Button ( "-", new Rect ( 0, offset.y, 24, 16 ) ) ) {
					node.speak.RemoveLine ( node.speak.lines.Length - 1 );
					node.SetOutputAmount ( node.speak.lines.Length );
					OCTreeEditor.Refresh ();
				
				} else if ( Button ( "+", new Rect ( 30, offset.y, 24, 16 ) ) ) {
					node.speak.AddLine ();
					node.SetOutputAmount ( node.speak.lines.Length );
					OCTreeEditor.Refresh ();
				
				} 

				break;

			case OCNodeType.Event:
				node.event.message = TextField ( "Message", node.event.message );

				if ( node.event.eventToTarget || node.event.object == null ) {
					node.event.argument = TextField ( "Argument", node.event.argument );
				}

				node.event.object = ObjectField ( "Object", node.event.object, typeof ( GameObject ), OEObjectField.Target.Scene ) as GameObject;

				if ( node.event.object != null ) {
					node.event.eventToTarget = Toggle ( "Event to target", node.event.eventToTarget );
				
				} else {
					node.event.eventToTarget = false;

				}

				break;

			case OCNodeType.Jump:
				node.jump.rootNode = Popup ( "Jump to root", node.jump.rootNode, rootNodeStrings );
				break;

			case OCNodeType.SetFlag:
				node.setFlag.flag = TextField ( "Flag", node.setFlag.flag );
				node.setFlag.b = Toggle ( "Bool", node.setFlag.b );
				break;
			
			case OCNodeType.GetFlag:
				node.getFlag.flag = TextField ( "Flag", node.getFlag.flag );
				break;
			
			case OCNodeType.End:
				node.end.rootNode = Popup ( "Next root", node.end.rootNode, rootNodeStrings );
				break;
		}
	}
}
