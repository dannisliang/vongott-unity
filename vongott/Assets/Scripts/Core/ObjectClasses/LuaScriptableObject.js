#pragma strict

import LuaInterface;

public class LuaScriptableObject extends MonoBehaviour {
	public var luaString : String = "";
	
	private var lua : Lua = new Lua ();
	private var start : LuaFunction;
	private var update : LuaFunction;
	private var onTrigger : LuaFunction;
	private var onEvent : LuaFunction;

	private var triggerId : String = "player";

	public function Start () {
		lua.DoString ( luaString );

		start = lua.GetFunction ( "Start" );
		update = lua.GetFunction ( "Update" );
		onTrigger = lua.GetFunction ( "OnTrigger" );
		onEvent = lua.GetFunction ( "OnEvent" );

		if ( start && !OEWorkspace.GetInstance() ) {
			start.Call ( this, GameCore.GetLuaManager () );
		}
	}

	public function Update () {
		if ( update && !OEWorkspace.GetInstance() ) {
			update.Call ( Time.deltaTime );
		}
	}

	// Event
	public function Event ( msg : String ) {
		if ( onEvent ) {
			onEvent.Call ( msg );
		}
	}

	// Trigger
	public function TriggerBy ( by : String ) {
		triggerId = by;
	}

	public function OnTriggerEnter ( col : Collider ) {
		if ( OEWorkspace.GetInstance() ) { return; }
		
		var p : Player = col.gameObject.GetComponent.< Player > ();
		var c : OACharacter = col.gameObject.GetComponent.< OACharacter > ();

		if ( onTrigger ) {
			if ( triggerId == "player" && p ) {
				onTrigger.Call ( p );
			
			} else if ( ( triggerId == "enemy" && c && c.isEnemy ) || ( triggerId == "ally" && c && !c.isEnemy ) ) {
				onTrigger.Call ( c );

			} else if ( triggerId == "all" ) {
				if ( p ) {
					onTrigger.Call ( p );
				
				} else if ( c ) {
					onTrigger.Call ( c );

				}
			}
		}
	}

	// Transform
	public function SetPosition ( x : float, y : float, z : float ) {
		this.transform.position = new Vector3 ( x, y, z );
	}

	public function Translate ( x : float, y : float, z : float ) {
		var newPos : Vector3 = this.transform.position + new Vector3 ( x, y, z );

		this.transform.position = newPos;
	}
	
	public function GetPosition () : Vector3 {
		return this.transform.position;
	}
	
	public function SetRotation ( x : float, y : float, z : float ) {
		this.transform.localRotation = Quaternion.Euler ( new Vector3 ( x, y, z ) );
	}

	public function Rotate ( x : float, y : float, z : float ) {
		var newRot : Vector3 = this.transform.localEulerAngles + new Vector3 ( x, y, z );

		this.transform.localRotation = Quaternion.Euler ( newRot );
	}
	
	public function GetRotation () : Vector3 {
		return this.transform.localEulerAngles;
	}
	
	public function SetScale ( x : float, y : float, z : float ) {
		this.transform.localScale = new Vector3 ( x, y, z );
	}

	public function Scale ( x : float, y : float, z : float ) {
		var newScl : Vector3 = this.transform.localScale + new Vector3 ( x, y, z );

		this.transform.localScale = newScl;
	}
	
	public function GetScale () : Vector3 {
		return this.transform.localScale;
	}
	
	// Collider
	public function SetCollider ( type : String ) {
		if ( type != "none" ) {
			if ( collider ) {
				Destroy ( collider );
			}

			switch ( type ) {
				case "box":
					this.gameObject.AddComponent.< BoxCollider > ();
					break;

				case "sphere":
					this.gameObject.AddComponent.< SphereCollider > ();
					break;
				
				case "capsule":
					this.gameObject.AddComponent.< CapsuleCollider > ();
					break;
				
				case "mesh":
					this.gameObject.AddComponent.< MeshCollider > ();

					var mf : MeshFilter = this.GetComponentInChildren.< MeshFilter > ();

					if ( mf ) {
						this.gameObject.GetComponent.< MeshCollider > ().sharedMesh = mf.mesh;
					}
					break;
			}

		} else if ( collider ) {
			Destroy ( collider );
		}
	}

	// Rigidbody
	public function SetWeight ( weight : float ) {
		if ( !rigidbody ) {
			this.gameObject.AddComponent.< Rigidbody > ();
		}
		
		if ( weight > 0 ) {
			rigidbody.mass = weight;
			rigidbody.useGravity = true;
		
		} else { 
			rigidbody.useGravity = false;
		
		}
	}

	public function Push ( x : float, y : float, z : float ) {
		if ( rigidbody ) {
			rigidbody.AddForce ( new Vector3 ( x, y, z ) );
		}
	}

	public function SetVelocity ( x : float, y : float, z : float ) {
		if ( rigidbody ) {
			rigidbody.velocity = new Vector3 ( x, y, z );
		}
	}

}
