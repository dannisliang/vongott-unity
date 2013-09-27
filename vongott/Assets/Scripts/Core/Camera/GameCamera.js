#pragma strict

class GameCamera extends MonoBehaviour {
	private var player : PlayerController;
	
	public var sensitivity : float = 2.5;
	public var distance : float = 3;
    public var returnSpeed : float = 1.0;
	public var turnSpeed : float = 2;
	public var translateSpeed : float = 5;
	public var offset : Vector3;
	
	function Start () {
		player = GameObject.FindObjectOfType ( PlayerController );
	}
	    
    function LateUpdate (){
        var target : Vector3 = player.transform.position;
        target.y += offset.y;
        target += transform.right * offset.x;
        
        // this will solve a zeroing error later as well as provide a smooth rollback to the camera.
        transform.Translate ( -Vector3.forward * returnSpeed * Time.deltaTime );
       
        // Rotate the camera
        var xDeg : float = Input.GetAxis("Mouse X") * turnSpeed;  // Yaw
        var yDeg : float = Input.GetAxis("Mouse Y") * turnSpeed;  // Pitch      
        transform.RotateAround(target, Vector3.up, xDeg * Time.deltaTime);
        transform.RotateAround(target, transform.right, -yDeg * Time.deltaTime);
       
        var dist : float = distance + 1.0f; // distance to the camera + 1.0 so the camera doesnt jump 1 unit in if it hits someting far out
        var targetPosition : Vector3; // get the position the camera should be.
        var ray : Ray = new Ray(target, transform.position-target);// get a ray in space from the target to the camera.
        var hit : RaycastHit;
        // read from the taret to the targetPosition;
        if(Physics.Raycast(ray,hit, dist)){
            //if ( hit.collider.gameObject.tag != "dynamic" ) {
	            dist = hit.distance - 1.0;
        	//}
        }

        if ( dist > distance ) { dist = distance; }
        if ( dist < 0.0 ) { dist = 0.0; }

        transform.position = ray.GetPoint(dist);
    }
}