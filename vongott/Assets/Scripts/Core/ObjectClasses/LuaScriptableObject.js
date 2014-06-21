#pragma strict

import LuaInterface;

public class LuaScriptableObject extends MonoBehaviour {
	public var luaString : String = "";
	
	private var lua : Lua = new Lua ();
	private var start : LuaFunction;
	private var update : LuaFunction;
	private var onTrigger : LuaFunction;

	private var triggerId : String = "player";

	public function Start () {
		lua.DoString ( luaString );

		start = lua.GetFunction ( "start" );
		update = lua.GetFunction ( "update" );
		onTrigger = lua.GetFunction ( "onTrigger" );

		if ( start ) {
			start.Call ( this, GameObject.FindObjectOfType.< LuaManager >() );
		}
	}

	public function Update () {
		if ( update ) {
			update.Call ( Time.deltaTime );
		}
	}

	// Trigger
	public function triggerBy ( by : String ) {
		triggerId = by;
	}

	public function OnTriggerEnter ( col : Collider ) {
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
	public function setPosition ( x : float, y : float, z : float ) {
		this.transform.position = new Vector3 ( x, y, z );
	}

	public function translate ( x : float, y : float, z : float ) {
		var newPos : Vector3 = this.transform.position + new Vector3 ( x, y, z );

		this.transform.position = newPos;
	}
	
	public function getPosition () : Vector3 {
		return this.transform.position;
	}
	
	public function setRotation ( x : float, y : float, z : float ) {
		this.transform.rotation = Quaternion.Euler ( new Vector3 ( x, y, z ) );
	}

	public function rotate ( x : float, y : float, z : float ) {
		var newRot : Vector3 = this.transform.eulerAngles + new Vector3 ( x, y, z );

		this.transform.rotation = Quaternion.Euler ( newRot );
	}
	
	public function getRotation () : Vector3 {
		return this.transform.eulerAngles;
	}
	
	public function setScale ( x : float, y : float, z : float ) {
		this.transform.localScale = new Vector3 ( x, y, z );
	}

	public function scale ( x : float, y : float, z : float ) {
		var newScl : Vector3 = this.transform.localScale + new Vector3 ( x, y, z );

		this.transform.localScale = newScl;
	}
	
	public function getScale () : Vector3 {
		return this.transform.localScale;
	}
	
	// Collider
	public function setCollider ( type : String ) {
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
	public function setWeight ( weight : float ) {
		if ( weight > 0 ) {
			if ( !rigidbody ) {
				this.gameObject.AddComponent.< Rigidbody > ();
			}

			rigidbody.mass = weight;

		} else if ( rigidbody ) {
			Destroy ( rigidbody );

		}
	}

	public function useGravity ( use : boolean ) {
		if ( rigidbody ) {
			rigidbody.useGravity = use;
		}
	}

	public function push ( x : float, y : float, z : float ) {
		if ( rigidbody ) {
			rigidbody.AddForce ( new Vector3 ( x, y, z ) );
		}
	}

	public function setVelocity ( x : float, y : float, z : float ) {
		if ( rigidbody ) {
			rigidbody.velocity = new Vector3 ( x, y, z );
		}
	}

}
