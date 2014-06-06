#pragma strict

public class LadderInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( Ladder ); }
	
	override function Inspector () {
		var ladder : Ladder = target.GetComponent.< Ladder > ();

		ladder.segments = IntField ( "Segments", ladder.segments );
	}
}
