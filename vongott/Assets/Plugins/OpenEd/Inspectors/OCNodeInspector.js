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
		
		var newType : int = Popup ( "Type", node.type, System.Enum.GetNames ( OCNodeType ) );

		if ( newType != node.type ) {
			node.SetType ( newType );
			OCTreeEditor.Refresh ();
		}

		switch ( node.type ) {
			case OCNodeType.Speak:
				node.speak.speaker = Popup ( "Speaker", node.speak.speaker, tree.GetSpeakerStrings () );

				offset.y += 20;

				for ( var i : int = 0; i < node.speak.lines.Length; i++ ) {
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
		}
	}
}
