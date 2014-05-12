#pragma strict

public class OETreeInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( OCTree ); }

	private function DrawNode ( node : OCNode, x : float, y : float ) {
		var nodeTypeStrings : String[] = System.Enum.GetNames ( typeof ( OCNodeType ) );
		var typeIndex : int = node.type;
		var newTypeIndex : int = 0;
		
		newTypeIndex = Popup ( "Type", typeIndex, nodeTypeStrings );

		switch ( node.type ) {
			case OCNodeType.Speak:	
				for ( var l : int = 0; l < node.speak.lines.Length; l++ ) {
					node.speak.lines[l] = TextField ( "", node.speak.lines[l], new Rect ( x + 10, y + l * 20, 200, 16 ) );
					
					if ( l > 0 ) {
						Button ( "x", function () {
							var tmpLines : List.< String > = new List. < String > ( node.speak.lines );
							tmpLines.RemoveAt ( l );
							node.speak.lines = tmpLines.ToArray ();
						}, new Rect ( x + 220, y + l * 20, 24, 16 ) );
					}
				}
				
				Button ( "+", function () {
					var tmpLines : List.< String > = new List.< String > ( node.speak.lines );
					tmpLines.Add ( "" );
					node.speak.lines = tmpLines.ToArray ();
				}, new Rect ( x + 10, y + node.speak.lines.Length * 20, 24, 16 ) );
				
				break;
		}
	}

	override function Inspector () {
		var tree : OCTree = target.GetComponent.< OCTree >();
	
		var rootNodeStrings : String[] = new String[tree.rootNodes.Length];
		for ( var i : int = 0; i < rootNodeStrings.Length; i++ ) {
			rootNodeStrings[i] = i.ToString();
		}
		
		//Label ( "Speakers", EditorStyles.boldLabel );

		for ( i = 0; i < tree.speakers.Length; i++ ) {
			tree.speakers[i].id = TextField ( i.ToString(), tree.speakers[i].id, new Rect ( 0, i * 20, 200, 16 ) );
			
			Button ( "x", function () {
				tree.RemoveSpeaker ( i );
			}, new Rect ( 210, i * 20, 24, 16 ) );

		}

		Button ( "+", function () {
			tree.AddSpeaker ();
		}, new Rect ( 0, tree.speakers.Length * 20, 24, 16 ) );
		
		DrawNode ( tree.rootNodes[0].nodes[0], 10, 100 );
	}
}
