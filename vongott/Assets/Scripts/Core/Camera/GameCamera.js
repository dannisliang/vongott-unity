#pragma strict

class GameCamera extends MonoBehaviour {
	private var player : Player;
	private var storedPos : Vector3;
	private var storedRot : Vector3;
	private var storedMaterials : List.< Material > = new List.< Material >();
	private var boundingBoxModifier : float = 1.0;
	private var boundingBoxDelta : float = 0.1;
	private var currentSpeaker : GameObject;
	private var focusSleep : float = 0;

	public var boundingBoxMaterial : Material;
	public var firstPerson : boolean = false;	
	public var inConvo : boolean = false;
	public var convoPosition : Vector3;
	public var convoFocus : Vector3;
	public var weaponContainer : Transform;

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
	function StorePosRot () {
		storedPos = this.transform.position;
		storedRot = this.transform.eulerAngles;
	}
	
	function RestorePosRot () {
		this.transform.position = storedPos;
		this.transform.eulerAngles = storedRot;
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
	
	public function ConvoFocus ( speaker : GameObject ) {
		if ( currentSpeaker == speaker ) {
			return;
		} else {
			currentSpeaker = speaker;
		}

		var speakers : OCSpeaker[] = GameCore.GetConversationManager().speakers;
		for ( var i : int = 0; i < speakers.Length; i++ ) {
			var go : GameObject = speakers[i].gameObject;
			
			if ( go ) {
				var a : OACharacter = go.GetComponent.< OACharacter > ();

				if ( a ) {
					a.inConversation = true;
				}
			}

			if ( !speakers[i].gameObject && speakers[i].gameObject != currentSpeaker ) {
				speakers[i].gameObject.transform.LookAt ( currentSpeaker.transform.position );
			
			} else {
				speakers[i].gameObject.transform.LookAt ( player.transform.position );
			
			}
		}
		
		var random : float = Random.Range ( 0, 5 );
		
		convoFocus = GetConvoFocus ( random, speaker.transform );
		convoPosition = GetConvoPosition ( random, speaker.transform );

		this.transform.position = convoPosition;
		this.transform.LookAt ( convoFocus );
	}
	
	private function GetConvoCenter () : Vector3 { 
		var center : Vector3;
		var speakers : OCSpeaker[] = GameCore.GetConversationManager().speakers;
	
		for ( var i : int = 0; i < speakers.Length; i++ ) {
			center += speakers[i].gameObject.transform.position;
		}

		center = ( ( center ) / speakers.Length ) + new Vector3 ( 0, 1.5, 0 );
	
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
		var speakers : OCSpeaker[] = GameCore.GetConversationManager().speakers;
	
		for ( var i : int = 0; i < speakers.Length; i++ ) {
			var distance : float = Vector3.Distance ( speakers[i].gameObject.transform.position, GetConvoCenter() );

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

	public function ToggleFlashlight () {
		this.GetComponent.< Light > ().enabled = !this.GetComponent.< Light > ().enabled;
	}
	

	////////////////////
	// Render
	////////////////////
	function OnPostRender () {
		if ( player && player.stats.hp > 0 && !inConvo && GameCore.GetInteractiveObject() && !GameCore.interactiveObjectLocked ) {
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

		// Death cam
		if ( player.stats.hp <= 0 ) {
			var center : Vector3;
			var colliders : Collider[] = player.gameObject.GetComponentsInChildren.< Collider > ();

			for ( var i : int = 0; i < colliders.Length; i++ ) {
				center += colliders[i].bounds.center;
			}

			center /= colliders.Length;

			this.transform.position.x = center.x;
			this.transform.position.z = center.z;
			this.transform.position = Vector3.Slerp ( this.transform.position, center + new Vector3 ( 0, 6, 0 ), Time.deltaTime * 0.5 );
			this.transform.rotation = Quaternion.Euler ( new Vector3 ( 90, this.transform.eulerAngles.y + Time.deltaTime * 5, 0 ) );
			camera.cullingMask = controller.thirdPersonLayerMask;
		
		} else {
			// Check for conversation cam
			if ( inConvo ) {
				camera.cullingMask = controller.thirdPersonLayerMask;
				this.transform.position = convoPosition;
				this.transform.rotation = Quaternion.LookRotation ( convoFocus - this.transform.position );
			}

			// Check for interaction
			if ( !GameCore.interactiveObjectLocked ) {
				var hit : RaycastHit;

				Debug.DrawRay ( transform.position, transform.forward * 4, Color.yellow );

				if ( Physics.Raycast ( transform.position, transform.forward, hit, 4 ) ) {
					var thisObject : InteractiveObject = hit.collider.GetComponent.< InteractiveObject > ();
				
					if ( thisObject && GameCore.GetInteractiveObject() != thisObject ) {
						thisObject.Focus ();
						focusSleep = 1;
					}
						
				} else if ( GameCore.GetInteractiveObject() && focusSleep <= 0 ) {
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

			// Camera controller state
			switch ( controller.state ) {
				case eCameraState.ThirdPerson:
					player.controller.controlMode = ePlayerControlMode.ThirdPerson;
					break;

				case eCameraState.FirstPerson:
					player.controller.controlMode = ePlayerControlMode.FirstPerson;
					break;
			}

			// Focus sleep
			if ( focusSleep > 0 ) {
				focusSleep -= GameCore.GetInstance().ignoreTimeScale;
			}
		}
	}
}
