#pragma strict

class GameCamera extends MonoBehaviour {
	private var player : Player;
	private var skyboxCamera : GameObject;
	private var storedPos : Vector3;
	private var storedRot : Vector3;
	private var storedMaterials : List.< Material > = new List.< Material >();
	private var boundingBoxModifier : float = 1.0;
	private var boundingBoxDelta : float = 0.1;
	private var shakeAmount : float;
	private var shakeFadeOut : float;
	private var currentSpeaker : GameObject;
	
	public var firstPersonLayerMask : LayerMask;
	public var thirdPersonLayerMask : LayerMask;
	public var xRayShader : Shader;
	public var regularShader : Shader;
	public var boundingBoxMaterial : Material;
	public var firstPerson : boolean = false;	
	public var inConvo : boolean = false;
	public var convoPosition : Vector3;
	public var convoFocus : Vector3;

	public static var instance : GameCamera;
	public static var controller : CameraController;


	////////////////////
	// Init
	////////////////////																	
	function Start () {
		instance = this;
		controller = this.GetComponent(CameraController);
	}
	
	public static function GetInstance () : GameCamera {
		return instance;
	}
	
	
	////////////////////
	// Positioning and rotation
	////////////////////
	public function Shake ( amount : float, fadeOut : float ) {
		shakeAmount = amount;
		shakeFadeOut = fadeOut;
	}
	
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
	
	private function CalculateCorner ( t : Transform, m : Vector3, center : Vector3, size : Vector3 ) : Vector3 {
		return t.position + center + ((t.right*m.x)*(size.x/2)) + ((t.up*m.y)*(size.y/2)) + ((t.forward*m.z)*(size.z/2));
	}
	
	private function DrawBoundingBox ( obj : GameObject ) {
		var center : Vector3;
		var size : Vector3;
	
		var bc : BoxCollider = obj.GetComponent ( BoxCollider );
		var cc : CharacterController = obj.GetComponent ( CharacterController );
		var sc : SphereCollider = obj.GetComponent ( SphereCollider );

		if ( bc ) {
			center = bc.center;
			size = bc.size * boundingBoxModifier;
		
		} else if ( sc ) {
			center = sc.center;
			size = new Vector3 ( sc.radius, sc.radius, sc.radius ) * boundingBoxModifier;
	
		} else if ( cc ) {
			center = cc.center;
			size = new Vector3 ( cc.radius*2, cc.height, cc.radius*2 ) * boundingBoxModifier;

		} else {
			return;
		
		}
		
		var corners : Vector3[] = [
			// Bottom
			CalculateCorner ( obj.transform, new Vector3 ( -1, -1, -1 ), center, size ),
			CalculateCorner ( obj.transform, new Vector3 ( 1, -1, -1 ), center, size ),
			CalculateCorner ( obj.transform, new Vector3 ( 1, -1, 1 ), center, size ),
			CalculateCorner ( obj.transform, new Vector3 ( -1, -1, 1 ), center, size ),
		
			// Top
			CalculateCorner ( obj.transform, new Vector3 ( -1, 1, -1 ), center, size ),
			CalculateCorner ( obj.transform, new Vector3 ( 1, 1, -1 ), center, size ),
			CalculateCorner ( obj.transform, new Vector3 ( 1, 1, 1 ), center, size ),
			CalculateCorner ( obj.transform, new Vector3 ( -1, 1, 1 ), center, size )	
		];
		
		boundingBoxMaterial.SetPass(0);

		GL.Begin ( GL.LINES );
				
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
		for ( var c : Component in GameObject.FindObjectsOfType ( OACharacter ) ) {
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
		
	public function ConvoFocus ( speaker : GameObject, smooth : boolean ) {
		if ( currentSpeaker == speaker ) {
			return;
		} else {
			currentSpeaker = speaker;
		}

		var speakers : GameObject[] = GameCore.GetConversationManager().tree.speakers;
		for ( var i : int = 0; i < speakers.Length; i++ ) {
			if ( speakers[i] != currentSpeaker ) {
				speakers[i].transform.LookAt ( currentSpeaker.transform.position );
			
			} else {
				speakers[i].transform.LookAt ( player.transform.position );
			
			}
		}
		
		var random : float = Random.Range ( 0, 5 );
		
		convoFocus = GetConvoFocus ( random, speaker.transform );
		convoPosition = GetConvoPosition ( random, speaker.transform );

		if ( !smooth ) {
			this.transform.position = convoPosition;
			this.transform.LookAt ( convoFocus );
		}
	}
	
	private function GetConvoCenter () : Vector3 { 
		var center : Vector3;
		var gameObjects : GameObject[] = GameCore.GetConversationManager().tree.speakers;
	
		for ( var i : int = 0; i < gameObjects.Length; i++ ) {
			center += gameObjects[i].transform.position;
		}

		center = ( ( center ) / gameObjects.Length ) + new Vector3 ( 0, 1.5, 0 );
	
		return center;
	}

	private function GetConvoFocus ( random : float, forceLook : Transform ) : Vector3 {
		var result : Vector3 = forceLook.position;

		if ( random > 4 ) {
			result = forceLook.position;

		} else if ( random > 3 && forceLook != player.transform ) {
			result = ( ( forceLook.position + player.transform.position ) / 2 ) + new Vector3 ( 0, 1.5, 0 );

		} else if ( random > 2 ) {
			result += forceLook.forward * 0.8 + new Vector3 ( 0, 1.4, 0 );
		
		} else if ( random > 1 ) {
			result += forceLook.forward * 0.8 + new Vector3 ( 0, 1.4, 0 );
		
		} else {
			result += forceLook.forward * 0.5 + new Vector3 ( 0, 1.5, 0 );

		}

		return result;
	}

	private function GetConvoRadius () : float {
		var result : float;
		var gameObjects : GameObject[] = GameCore.GetConversationManager().tree.speakers;
	
		for ( var i : int = 0; i < gameObjects.Length; i++ ) {
			var distance : float = Vector3.Distance ( gameObjects[i].transform.position, GetConvoCenter() );

			if ( distance > result ) {
				result = distance;
			}
		}

		return result;
	}

	private function GetConvoPosition ( random : float, forceLook : Transform ) : Vector3 {
		var result : Vector3 = convoFocus;
		
		if ( random > 4 ) {
			result = GetConvoCenter ();
		
		} else if ( random > 3 && forceLook != player.transform ) {
			result += forceLook.right * GetConvoRadius () * 1.5;

		} else if ( random > 2 ) {
			result += forceLook.forward * 1.25 + forceLook.right * 1.25;
		
		} else if ( random > 1 ) {
			result += forceLook.forward * 1.25 - forceLook.right * 1.25;

		} else {
			result += forceLook.forward * 1;

		}

		return result;
	}

	
	////////////////////
	// Render
	////////////////////
	function OnPostRender () {
		if ( GameCore.GetInteractiveObject() && !GameCore.interactiveObjectLocked ) {
			DrawBoundingBox ( GameCore.GetInteractiveObject().gameObject );
		}
	}	
	
	
	////////////////////
	// Update and collision
	////////////////////
	function Update () {
		// Find player
		if ( !player ) {
			player = GameCore.GetPlayer ();
		}
	
		// Check for conversation cam
		if ( inConvo ) {
			this.transform.position = Vector3.Slerp ( this.transform.position, convoPosition, Time.deltaTime * 2 );
			this.transform.rotation = Quaternion.Slerp ( this.transform.rotation, Quaternion.LookRotation ( convoFocus - this.transform.position ), Time.deltaTime * 5 );
		}

		// Check for interaction
		if ( !GameCore.interactiveObjectLocked ) {
			var hit : RaycastHit;
			Debug.DrawRay ( transform.position, transform.forward * 4, Color.yellow );
			if ( Physics.Raycast ( transform.position, transform.forward, hit, 4 ) ) {
				if ( hit.collider.GetComponent ( InteractiveObject ) && GameCore.GetInteractiveObject() != hit.collider.GetComponent(InteractiveObject) ) {
					hit.collider.GetComponent ( InteractiveObject ).Focus ();
				}
					
			} else if ( GameCore.GetInteractiveObject() ) {
					GameCore.GetInteractiveObject().Unfocus ();
			
			}
			
			// Bounding box modifier
			if ( boundingBoxModifier < 1 ) {
				boundingBoxDelta = 0.1;
			
			} else {
				boundingBoxDelta -= 0.3 * Time.deltaTime;
			 
			} 
			
			boundingBoxModifier += boundingBoxDelta * ( Time.deltaTime * 2 );
		}

		// Move skybox camera with camera
		if ( skyboxCamera ) {
			skyboxCamera.transform.rotation = transform.rotation;
			skyboxCamera.transform.localPosition = GameCore.GetPlayer().transform.position / 40;
		} else {
			skyboxCamera = GameObject.FindWithTag ( "SkyboxCamera" );
		}
		
		// Shake
		if ( shakeAmount > 0 ) {
			shakeAmount -= shakeFadeOut;

			controller.shakeOffset.x = Random.Range ( -shakeAmount, shakeAmount );
			controller.shakeOffset.y = Random.Range ( -shakeAmount, shakeAmount );
		
		} else {
			controller.shakeOffset = Vector2.zero;
		
		}

		// Camera controller state
		switch ( controller.state ) {
			case eCameraState.ThirdPerson:
				player.controller.controlMode = ePlayerControlMode.ThirdPerson;
				this.GetComponent(Camera).cullingMask = thirdPersonLayerMask;
				break;

			case eCameraState.FirstPerson:
				player.controller.controlMode = ePlayerControlMode.FirstPerson;
				this.GetComponent(Camera).cullingMask = firstPersonLayerMask;
				break;
		}
	}
}
