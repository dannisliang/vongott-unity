#pragma strict

public class OESphereColliderInspector extends OEComponentInspector {
	private var collider : SphereCollider;
	
	override function get type () : System.Type { return typeof ( SphereCollider ); }
	
	override function Inspector () {
		collider = target.GetComponent.< SphereCollider > ();

		collider.center = Vector3Field ( "Center", collider.center );
		collider.radius = FloatField ( "Radius", collider.radius );
	}

	override function DrawGL () {
		if ( collider ) {
			GL.Begin ( GL.LINES );
			
			OEWorkspace.GetInstance().cam.materials.highlight.SetPass ( 0 );
				
			var degRad = Mathf.PI / 180;
			var center : Vector3 = collider.transform.position + collider.center;
			var radius : float = collider.radius;
			var nextVector : Vector3;

			for ( var theta : float = 0; theta < ( 2 * Mathf.PI ); theta += 0.01 ) {
				nextVector = new Vector3 ( Mathf.Cos ( theta ) * radius + center.x, Mathf.Sin ( theta ) * radius + center.y, center.z );
				GL.Vertex ( nextVector );
			}

			GL.Vertex ( nextVector );
			
			for ( theta = 0; theta < ( 2 * Mathf.PI ); theta += 0.01 ) {
				nextVector = new Vector3 ( center.x, Mathf.Sin ( theta ) * radius + center.y, Mathf.Cos ( theta ) * radius + center.z );
				GL.Vertex ( nextVector );
			}
			
			for ( theta = 0; theta < ( 2 * Mathf.PI ); theta += 0.01 ) {
				nextVector = new Vector3 ( Mathf.Sin ( theta ) * radius + center.x, center.y, Mathf.Cos ( theta ) * radius + center.z );
				GL.Vertex ( nextVector );
			}

			GL.End ();
		}
	}
}
