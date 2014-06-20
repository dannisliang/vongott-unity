#pragma strict

public class OEBoxColliderInspector extends OEComponentInspector {
	private var collider : BoxCollider;
	
	override function get type () : System.Type { return typeof ( BoxCollider ); }
	
	override function Inspector () {
		collider = target.GetComponent.< BoxCollider > ();

		collider.center = Vector3Field ( "Center", collider.center );
		collider.size = Vector3Field ( "Size", collider.size );
	}

	override function DrawGL () {
		if ( collider ) {
			/*GL.Begin ( GL.LINES );
			
			OEWorkspace.GetInstance().cam.materials.highlight.SetPass ( 0 );
			
			GL.End ();*/
		}
	}
}
