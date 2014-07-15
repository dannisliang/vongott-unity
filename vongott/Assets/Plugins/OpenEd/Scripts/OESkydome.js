#pragma strict

class OESkydome extends MonoBehaviour {
	public var cam : Camera;
	public var rotationModifier : Vector3 = new Vector3 ( 0.5, 1, 1 );
	public var positionModifier : float = 0.025;
	public var target : Transform;

	public function Update () {
		this.transform.position = new Vector3 ( 0, 2000, 0 );
	
		if ( !cam ) {
			cam = new GameObject ( "Camera" ).AddComponent.< Camera > ();
			cam.transform.parent = this.transform;
		
		} else if ( Camera.main ) {
			var rot : Vector3 = Camera.main.transform.eulerAngles;
			cam.transform.rotation = Quaternion.Euler ( new Vector3 ( rot.x * rotationModifier.x, rot.y * rotationModifier.y, rot.z * rotationModifier.z ) );

			if ( target ) {
				cam.transform.localPosition = target.position * positionModifier;
			
			} else {
				cam.transform.localPosition = Vector3.zero;

			}
			
			cam.depth = Camera.main.depth - 1;

		}

	}
}
