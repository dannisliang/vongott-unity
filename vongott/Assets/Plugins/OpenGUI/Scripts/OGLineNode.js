#pragma strict

public class OGLineNode extends OGWidget {
	public var connectedTo : OGLineNode [] = new OGLineNode [0];
	public var segments : int = 10;
	public var startDirection : Vector3 = Vector3.down;
	public var endDirection : Vector3 = Vector3.up;

	override function DrawLine () {
		for ( var i : int = 0; i < connectedTo.Length; i++ ) {
			if ( connectedTo [i] != null ) {
				OGDrawHelper.DrawCurve ( drawRct.center, startDirection, connectedTo[i].drawRct.center, endDirection, segments );
			}
		}
	}
}
