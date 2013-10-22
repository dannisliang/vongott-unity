#pragma strict

class GameCamera extends MonoBehaviour {
	private var player : PlayerController;
	private var skyboxCamera : GameObject;
	private var storedPos : Vector3;
	private var storedRot : Vector3;
	private var storedMaterials : List.< Material > = new List.< Material >();
	private var boundingBoxModifier : float = 1.0;
	private var boundingBoxDelta : float = 0.1;
	
	public var sensitivity : float = 2.5;
	public var distance : float = 3;
    public var returnSpeed : float = 1.0;
	public var turnSpeed : float = 2;
	public var translateSpeed : float = 5;
	public var offset : Vector3;
	public var xRayShader : Shader;
	public var regularShader : Shader;
	public var boundingBoxMaterial : Material;
	
	public static var instance : GameCamera;
	
	
	////////////////////
	// Init
	////////////////////																	
	function Start () {
		player = GameObject.FindObjectOfType ( PlayerController );
		instance = this;
	}
	
	public static function GetInstance () : GameCamera {
		return instance;
	}
	
	
	////////////////////
	// Positioning and rotation
	////////////////////
	function StorePosRot () {
		storedPos = this.transform.position;
		storedRot = this.transform.eulerAngles;
	}
	
	function RestorePosRot ( t : float ) {
		iTween.MoveTo ( this.gameObject, iTween.Hash ( "position", storedPos, "time", t, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
		iTween.RotateTo ( this.gameObject, iTween.Hash ( "rotation", storedRot, "time", t, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
	}
	
	function TweenLook ( v : Vector3, t : float ) {
		iTween.LookTo ( this.gameObject, iTween.Hash ( "time", t, "easetype", iTween.EaseType.easeInOutQuad, "looktarget", v ) );
	}
	
	function TweenPosition ( v : Vector3, t : float ) {
		iTween.MoveTo ( this.gameObject, iTween.Hash ( "time", t, "easetype", iTween.EaseType.easeInOutQuad, "position", v ) );
	}
	
	function TweenRotation ( v : Vector3, t : float ) {
		iTween.RotateTo ( this.gameObject, iTween.Hash ( "time", t, "easetype", iTween.EaseType.easeInOutQuad, "rotation", v ) );
	}
	
	function FocusOn ( pos : Vector3 ) {
		iTween.LookTo ( this.gameObject, iTween.Hash ( "easetype", iTween.EaseType.easeInOutQuad, "looktarget", pos, "time", 0.5, "ignoretimescale", true ) );
	}
	
	
	public function FocusInterface ( t : Transform, modifier : float ) : IEnumerator {
		var targetPos : Vector3 = t.position + t.forward * modifier;
		var targetRot : Vector3 = Quaternion.LookRotation ( t.position - targetPos ).eulerAngles;
		
		iTween.MoveTo ( this.gameObject, iTween.Hash ( "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "position", targetPos, "space", "world" ) );
		iTween.RotateTo ( this.gameObject, iTween.Hash ( "time", 1, "easetype", iTween.EaseType.easeInOutQuad, "rotation", targetRot, "space", "world" ) );
	
		BlurFocus ( t );
	
		yield WaitForSeconds ( 1 );
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
	
	
	////////////////////
	// Effects
	////////////////////
	private function DrawLine ( from : Vector3, to : Vector3 ) {
		GL.Vertex3 ( from.x, from.y, from.z );
		GL.Vertex3 ( to.x, to.y, to.z );
	}
	
	private function DrawCorner ( allCorners : Vector3[], from : int, toA : int, toB : int, toC : int ) {
		DrawLine ( allCorners[from], allCorners[from] + ( ( ( allCorners[from] + allCorners[toA] ) / 2 ) - allCorners[from] ).normalized * 0.05 );
		DrawLine ( allCorners[from], allCorners[from] + ( ( ( allCorners[from] + allCorners[toB] ) / 2 ) - allCorners[from] ).normalized * 0.05 );
		DrawLine ( allCorners[from], allCorners[from] + ( ( ( allCorners[from] + allCorners[toC] ) / 2 ) - allCorners[from] ).normalized * 0.05 );
	}
	
	private function DrawBoundingBox ( obj : GameObject ) {
		boundingBoxMaterial.SetPass(0);

		GL.Begin ( GL.LINES );
		
		var bounds : Bounds;
		var length : float = 0.1;
		
		if ( obj.GetComponent(BoxCollider) ) {
			bounds = obj.GetComponent(BoxCollider).bounds;
		} else if ( obj.GetComponent(MeshFilter) ) {
			bounds = obj.GetComponent(MeshFilter).sharedMesh.bounds;
		} else if ( obj.GetComponent(CapsuleCollider) ) {
			bounds = obj.GetComponent(CapsuleCollider).bounds;
		}
		
		bounds.extents = bounds.extents * boundingBoxModifier;
		
		var corners : Vector3[] = [
			// Bottom
			new Vector3 ( bounds.center.x - bounds.extents.x, bounds.center.y - bounds.extents.y, bounds.center.z - bounds.extents.z ),
			new Vector3 ( bounds.center.x + bounds.extents.x, bounds.center.y - bounds.extents.y, bounds.center.z - bounds.extents.z ),
			new Vector3 ( bounds.center.x + bounds.extents.x, bounds.center.y - bounds.extents.y, bounds.center.z + bounds.extents.z ),
			new Vector3 ( bounds.center.x - bounds.extents.x, bounds.center.y - bounds.extents.y, bounds.center.z + bounds.extents.z ),
		
			// Top
			new Vector3 ( bounds.center.x - bounds.extents.x, bounds.center.y + bounds.extents.y, bounds.center.z - bounds.extents.z ),
			new Vector3 ( bounds.center.x + bounds.extents.x, bounds.center.y + bounds.extents.y, bounds.center.z - bounds.extents.z ),
			new Vector3 ( bounds.center.x + bounds.extents.x, bounds.center.y + bounds.extents.y, bounds.center.z + bounds.extents.z ),
			new Vector3 ( bounds.center.x - bounds.extents.x, bounds.center.y + bounds.extents.y, bounds.center.z + bounds.extents.z )	
		];
		
		DrawCorner ( corners, 0, 4, 1, 3 );
		DrawCorner ( corners, 1, 5, 0, 2 );
		DrawCorner ( corners, 2, 6, 1, 3 );
		DrawCorner ( corners, 3, 7, 2, 0 );
		
		DrawCorner ( corners, 4, 7, 5, 0 );
		DrawCorner ( corners, 5, 4, 6, 1 );
		DrawCorner ( corners, 6, 5, 7, 2 );
		DrawCorner ( corners, 7, 6, 4, 3 );
	
		GL.End ();
	}
	
	public function SetXRay ( isActive : boolean, meters : int ) {
		for ( var c : Component in GameObject.FindObjectsOfType ( Actor ) ) {
			var go : GameObject = c.gameObject;
			
			var smr : SkinnedMeshRenderer = go.GetComponentInChildren ( SkinnedMeshRenderer );
			
			for ( var i : int = 0; i < smr.materials.Length; i++ ) {
				if ( isActive ) {
					smr.materials[i].shader = xRayShader;
				} else {
					smr.materials[i].shader = regularShader;
				}
			}
		}
	}
	
	function BlurFocus ( t : Transform ) {
		if ( t == null ) {
			t = GameObject.FindObjectOfType(OGRoot).transform;
		}
		
		this.GetComponent(DepthOfFieldScatter).focalTransform = t;
	}
	
	function ConvoFocus ( a : Actor, smooth : boolean ) {
		var height : Vector3 = new Vector3 ( 0, 1.7, 0 );
		var player : Player = GameCore.GetPlayer();
		var camPos : Vector3 = player.transform.position + height + ( player.transform.right * 0.6 ) - ( player.transform.forward * 0.6 );		
		var lookPos : Vector3 = a.transform.position + height; 
		var lookQuat : Quaternion = Quaternion.LookRotation ( lookPos - camPos );
		
		BlurFocus ( a.transform );
		
		if ( smooth ) {
			TweenPosition ( camPos, 1 );
			TweenRotation ( lookQuat.eulerAngles, 1 );
		
		} else {
			this.transform.position = camPos;	
			this.transform.LookAt ( lookPos );
		
		}
	}
	
	function ConvoFocus ( p : Player, smooth : boolean ) {
		var height : Vector3 = new Vector3 ( 0, 1.7, 0 );
		var actor : Actor = GameCore.GetPlayer().talkingTo;
		var camPos : Vector3 =  actor.transform.position + height + ( actor.transform.right * 0.6 ) - ( actor.transform.forward * 0.6 );		
		var lookPos : Vector3 = p.transform.position + height; 
		var lookQuat : Quaternion = Quaternion.LookRotation ( lookPos - camPos );
		
		BlurFocus ( p.transform );
		
		if ( smooth ) {
			TweenPosition ( camPos, 1 );
			TweenRotation ( lookQuat.eulerAngles, 1 );
		
		} else {
			this.transform.position = camPos;	
			this.transform.LookAt ( lookPos );
		
		}
	}
	
	function SetBlur ( state : boolean ) {
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
	}
	
	
	////////////////////
	// Render
	////////////////////
	function OnPostRender () {
		if ( GameCore.GetInteractiveObject() ) {
			DrawBoundingBox ( GameCore.GetInteractiveObject() );
		}
	}	
	
	
	////////////////////
	// Update and collision
	////////////////////
	function Update () {
		// Bounding box modifier
		if ( boundingBoxModifier < 1 ) {
			boundingBoxDelta = 0.1;
		
		} else {
			boundingBoxDelta -= 0.3 * Time.deltaTime;
		 
	  	} 
		
		boundingBoxModifier += boundingBoxDelta * ( Time.deltaTime * 2 );
			
	}
	
	function LateUpdate () {
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