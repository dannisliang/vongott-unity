#pragma strict

public class DoorInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( Door ); }
	
	override function Inspector () {
		var door : Door = target.GetComponent.< Door > ();

		door.locked = Toggle ( "Locked", door.locked );
		door.closed = Toggle ( "Closed", door.closed );
		door.keyId = TextField ( "Key ID", door.keyId );
		door.lockLevel = IntField ( "Level", door.lockLevel );
	}
}
