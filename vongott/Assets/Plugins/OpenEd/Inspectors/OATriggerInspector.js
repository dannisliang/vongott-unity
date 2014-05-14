#pragma strict

public class OATriggerInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( OATrigger ); }
	
	override function Inspector () {
		var trigger : OATrigger = target.GetComponent.< OATrigger >();
	
		trigger.type = Popup ( "Type", trigger.type, System.Enum.GetNames ( typeof ( OATriggerType ) ) );
		trigger.fireOnce = Toggle ( "Fire once", trigger.fireOnce );
		trigger.message = TextField ( "Message", trigger.message );	
		trigger.object = ObjectField ( "Object", trigger.object, typeof ( GameObject ), true ) as GameObject;	
		
		if ( !trigger.object ) {	
			trigger.argument = TextField ( "Argument", trigger.argument );
		
		} else {
			trigger.eventToTarget = Toggle ( "Event to target", trigger.eventToTarget );
			trigger.argument = "";

		}
	}	
}
