#pragma strict

public class DoorInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( Door ); }
	
	override function Inspector () {
		var door : Door = target.GetComponent.< Door > ();

		door.locked = Toggle ( "Locked", door.locked );
		
		var wasClosed = door.closed;
		var isClosed : boolean = Toggle ( "Closed", door.closed );
		
		if ( wasClosed != isClosed ) {
			door.closed = isClosed;
			door.CheckState ();
		}
		
		door.keyId = TextField ( "Key ID", door.keyId );
		door.lockLevel = IntField ( "Level", door.lockLevel );
	}
}
