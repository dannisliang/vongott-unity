#pragma strict

public class OSGrenade extends MonoBehaviour {
	public enum ExplodeTrigger {
		None,
		Timed,
		OnCollision
	}

	@HideInInspector public var item : OSItem;
	
	@HideInInspector public var firingRateIndex : int = 0;
	@HideInInspector public var damageIndex : int = 0;
	@HideInInspector public var rangeIndex : int = 0;
	
	@HideInInspector public var equippingSoundIndex : int = 0;
	@HideInInspector public var explodingSoundIndex : int = 0;
	@HideInInspector public var holsteringSoundIndex : int = 0;
	@HideInInspector public var throwingSoundIndex : int = 0;

	public var countdown : float = 5;
	public var trigger : ExplodeTrigger;
	public var armed : boolean = false;
	public var sticky : boolean = false;
	public var explosion : GameObject;
	public var explosionLifetime : float = 5;

	private var thrown : boolean = false;
	private var exploded : boolean = false;
	private var inventory : OSInventory;
	private var bezier : Bezier;
	private var bezierTimer : float;
	private var startNormal : Vector3;
	private var endNormal : Vector3;
	private var hit : RaycastHit;
	private var lineRenderer : LineRenderer;
	
	public function get range () : float {
		return item.attributes[rangeIndex].value;
	}

	public function SetInventory ( inventory : OSInventory ) {
		this.inventory = inventory;
	}

	public function Throw () {
		if ( !bezier ) { return; }
		
		this.transform.parent = this.transform.root.parent;
		
		thrown = true;
		
		if ( collider ) {
			collider.enabled = true;
		}
		
		if ( inventory ) {
			inventory.GetSlot ( item );
		}

		startNormal = this.transform.up;
	}

	public function Aim ( pos : Vector3, dir : Vector3 ) {
		if ( thrown ) { return; }
		
		var reflected : Vector3 = Vector3.Reflect ( dir, -Vector3.up );

		if ( Physics.Raycast ( pos, dir, hit, range ) ) {
			endNormal = hit.normal;
			bezier = new Bezier ( this.transform.position, dir, reflected, hit.point );
		
		} else if ( Physics.Raycast ( pos + dir * range, Vector3.down, hit, 1 ) ) {
			endNormal = hit.normal;
			bezier = new Bezier ( this.transform.position, dir, reflected, hit.point );
		
		}


		if ( lineRenderer && bezier ) {
			lineRenderer.SetVertexCount ( 8 );
			
			for ( var i : int = 0; i < 8; i++ ) {
				var time : float = ( i * 1.0 ) * ( 1.0 / 8 );

				lineRenderer.SetPosition ( i, bezier.GetPointAtTime ( time ) );
			}
		}
	}

	public function Explode () {
		if ( explosion ) {
			if ( explosion.activeInHierarchy ) {
				explosion.SetActive ( true );
				explosion.transform.parent = this.transform.parent;
				explosion.transform.position = this.transform.position;
			
			} else {
				explosion = Instantiate ( explosion ) as GameObject;
				explosion.transform.parent = this.transform.parent;
				explosion.transform.position = this.transform.position;
		
			}
		}

		exploded = true;
	}

	public function OnCollisionEnter () {
		if ( armed && trigger == ExplodeTrigger.OnCollision ) {
			Explode ();
		}
	}

	public function Start () {
		lineRenderer = this.GetComponent.< LineRenderer > ();
	}

	public function Update () {
		if ( exploded ) {
			if ( renderer ) {
				renderer.enabled = false;
			}
			
			if ( explosionLifetime <= 0 ) {
				Destroy ( this.gameObject );
				Destroy ( explosion );

			} else {
				explosionLifetime -= Time.deltaTime;

			}
		
		} else if ( armed ) {
			if ( trigger == ExplodeTrigger.Timed ) {
				Explode ();
			}
		
		} else if ( thrown ) {
			if ( bezierTimer > 1 ) {
				bezierTimer = 1;
			}

			if ( sticky ) {
				this.transform.up = Vector3.Lerp ( startNormal, endNormal, bezierTimer );
			
			}

			this.transform.localEulerAngles -= new Vector3 ( 0, 0, 720 ) * bezierTimer;

			if ( countdown <= 0 ) {
				armed = true;
			
			} else {
				countdown -= Time.deltaTime;
			
			}

			if ( bezierTimer >= 1 ) {
				if ( !sticky && rigidbody ) {	
					rigidbody.useGravity = true;
					rigidbody.isKinematic = false;
				}
			
			} else {
				this.transform.position = bezier.GetPointAtTime ( bezierTimer );
				
				bezierTimer += Time.deltaTime;

			}

		}
	}
}
