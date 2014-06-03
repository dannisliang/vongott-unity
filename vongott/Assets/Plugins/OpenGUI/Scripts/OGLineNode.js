#pragma strict

public class OGLineNode extends OGWidget {
	private class Connection {	
		public var node : OGLineNode;
		public var segments : Vector3 [] = new Vector3 [0];
		
		function Connection ( node : OGLineNode ) {
			this.node = node;
		}

		function Connection ( node : OGLineNode, segments : Vector3 [] ) {
			this.node = node;
			this.segments = segments;
		}

		public function SetSegment ( i : int, segment : Vector3 ) {
			var tmp : List.< Vector3 > = new List.< Vector3 > ( segments );

			tmp.Insert ( i, segment );

			segments = tmp.ToArray ();
		}
	}

	public var connections : Connection [] = new Connection [ 0 ];

	public function AddConnection ( node : OGLineNode ) {
		var tmp : List.< Connection > = new List.< Connection > ( connections );
		
		tmp.Add ( new Connection ( node ) );

		connections = tmp.ToArray ();
	}
	
	public function AddConnection ( node : OGLineNode, segments : Vector3 [] ) {
		var tmp : List.< Connection > = new List.< Connection > ( connections );
		
		tmp.Add ( new Connection ( node, segments ) );

		connections = tmp.ToArray ();
	}

	public function SetConnection ( i : int, node : OGLineNode ) {
		var tmp : List.< Connection > = new List.< Connection > ( connections );
		
		tmp.Insert ( i, new Connection ( node ) );

		connections = tmp.ToArray ();
	}

	override function DrawLine () {
		for ( var i : int = 0; i < connections.Length; i++ ) {
			if ( connections [i] != null ) {
				if ( connections[i].segments.Length == 0 ) {
					OGDrawHelper.DrawLine ( drawRct.center, connections[i].node.drawRct.center );
				
				} else {
					for ( var s : int = 0; s < connections[i].segments.Length; s++ ) {
						if ( s == 0 ) {
							OGDrawHelper.DrawLine ( drawRct.center, drawRct.center + connections[i].segments[s] );
							
						} else if ( s == connections[i].segments.Length - 1 ) {
							OGDrawHelper.DrawLine ( drawRct.center + connections[i].segments[s-1], drawRct.center + connections[i].segments[s] );
							OGDrawHelper.DrawLine ( drawRct.center + connections[i].segments[s], connections[i].node.drawRct.center );
						
						} else {
							OGDrawHelper.DrawLine ( drawRct.center + connections[i].segments[s-1], drawRct.center + connections[i].segments[s] );
						
						}
					}

				}
			}
		}
	}
}
