#pragma strict

public class OJSequenceInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( OJSequence ); }
	
	override function Inspector () {
		var sequence : OJSequence = target.GetComponent.< OJSequence >();

		if ( Button ( "Open editor" ) ) {
			OJSequenceEditor.sequence = sequence;
			OGRoot.GetInstance().GoToPage ( "SequenceEditor" );
		}
	}	
}
