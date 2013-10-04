#pragma strict

class GameCamera extends MonoBehaviour {
	private var player : PlayerController;
	private var skyboxCamera : GameObject;
	
	public var sensitivity : float = 2.5;
	public var distance : float = 3;
    public var returnSpeed : float = 1.0;
	public var turnSpeed : float = 2;
	public var translateSpeed : float = 5;
	public var offset : Vector3;
	
	public static var instance : GameCamera;
				
	function Start () {
		player = GameObject.FindObjectOfType ( PlayerController );
	
		instance = this;
	}
	
	public static function GetInstance () : GameCamera {
		return instance;
	}
	
	function SetBlur ( state : boolean ) {
		SetBlur ( state, null );
	}
	
	function BlurFocus ( t : Transform ) {
		if ( t == null ) {
			t = GameObject.FindObjectOfType(OGRoot).transform;
		}
		
		this.GetComponent(DepthOfFieldScatter).focalTransform = t;
	}
	
	function SetBlur ( state : boolean, t : Transform ) {
		var a : float;
		var b : float;
		
		if ( state ) {
			a = 1;
			b = 25;
		} else {
			a = 25;
			b = 1;
		}
		
		iTween.ValueTo ( gameObject, iTween.Hash ( "from", a, "to", b, "onupdate", "SetMaxBlurSize", "time", 0.5, "ignoretimescale", true ) );
	
		BlurFocus ( t );
	}
	
	function FocusOn ( pos : Vector3 ) {
		iTween.LookTo ( this.gameObject, iTween.Hash ( "easetype", iTween.EaseType.easeInOutQuad, "looktarget", pos, "time", 0.5, "ignoretimescale", true ) );
	}
	
	function FocusOnBodyPart ( n : String ) {
		var p : Transform = GameCore.GetPlayerObject().transform;
		
		var position : Vector3 = p.position;
		var rotation : Vector3 = p.eulerAngles;
		
		switch ( n ) {
			case "Eyes":
				position.y += 1.65;
				position += p.forward * 2;
				rotation.y += 180;
				break;
			
			case "Skull":
				position.y += 1.65;
				position += p.forward * 2;
				rotation.y += 180;
				break;
			
			case "Legs":
				position.y += 0.5;
				position += p.forward * 2;
				rotation.y += 180;
				break;
				
			case "Torso":
				position.y += 1.3;
				position += p.forward * 2;
				rotation.y += 180;
				break;
			
			case "Abdomen":
				position.y += 1;
				position += p.forward * 2;
				rotation.y += 180;
				break;
				
			case "Arms":
				position.y += 1.2;
				position += p.forward * 2;
				rotation.y += 180;
				break;
				
			case "Back":
				position.y += 1.4;
				position -= p.forward * 2;
				break;
		}
		
		FocusCamera ( p.position, position, rotation, 4 );
	}
	
    private function FocusCamera ( point : Vector3, position : Vector3, rotation : Vector3, time : float) {
		point.y = position.y;
	    	   	    	    	   	    	    
	    transform.position = position;//= Vector3.Slerp(transform.position, position, time * Time.fixedDeltaTime );
		transform.eulerAngles = rotation;// ( point );//= Quaternion.Slerp( transform.rotation, Quaternion.LookRotation( point - transform.position ), time * Time.fixedDeltaTime );
    }
	
	function FocusOn ( target : Transform, moveCam : boolean ) {
		if ( moveCam ) {
			iTween.MoveTo ( this.gameObject, iTween.Hash ( "easetype", iTween.EaseType.easeInOutQuad, "position", target.position + target.forward * 2, "time", 0.5, "ignoretimescale", true ) );
			iTween.RotateTo ( this.gameObject, iTween.Hash ( "easetype", iTween.EaseType.easeInOutQuad, "rotation", target.eulerAngles + new Vector3 ( 0, 180, 0 ), "time", 0.5, "ignoretimescale", true ) );
		
		} else {
			iTween.LookTo ( this.gameObject, iTween.Hash ( "easetype", iTween.EaseType.easeInOutQuad, "looktarget", target.position, "time", 0.5, "ignoretimescale", true ) );
		
		}
	}
	
    function LateUpdate (){
        var target : Vector3 = player.transform.position;
        target.y += offset.y;
        target += transform.right * offset.x;
        
        transform.Translate ( -Vector3.forward * returnSpeed * Time.deltaTime );
       
        var xDeg : float = Input.GetAxis("Mouse X") * turnSpeed; 
        var yDeg : float = Input.GetAxis("Mouse Y") * turnSpeed;
        transform.RotateAround(target, Vector3.up, xDeg * Time.deltaTime);
        transform.RotateAround(target, transform.right, -yDeg * Time.deltaTime);
       
        var dist : float = distance + 1.0f;
        var ray : Ray = new Ray ( target, transform.position - target );
        var hit : RaycastHit;
        
        if( Physics.Raycast ( ray, hit, dist ) ) {
            if ( hit.collider.gameObject.tag == "wall" ) {
	            dist = hit.distance - 1.0;
	            
	            Debug.DrawLine ( this.transform.position, hit.point, Color.red );
        	}
        }

        if ( dist > distance ) { dist = distance; }
        if ( dist < 0.0 ) { dist = 0.0; }

        transform.position = ray.GetPoint(dist);
        
        if ( skyboxCamera ) {
			skyboxCamera.transform.rotation = transform.rotation;
			skyboxCamera.transform.localPosition = player.transform.position / 40;
		} else {
			skyboxCamera = GameObject.FindWithTag ( "SkyboxCamera" );
		}
    }
}